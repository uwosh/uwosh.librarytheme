from zope.interface import Interface
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName

from uwosh.librarytheme.browser.subviews import SubBrowserView

import httplib
import urllib
import urlparse
import simplejson

import logging
logger = logging.getLogger("Plone")


class IFind(Interface):
    """ Marker Interface """

class Find(SubBrowserView):
    """ 
    This class is used for all non-javascript searching. The type
    request determines what search is being performed.
    """
    
    def __call__(self):
        self.search_cat = self.request.form.get("category","none")
        self.search_type = self.request.form.get("type",None)
        return super(Find,self).__call__()

class FindCourse(SubBrowserView):
    """ 
    This class is used for non-javascript website and course searching.
    It is also the default search if they ignore the auto-complete.
    """

    LIMIT = "10" # FINAL
    OFFSET = "0" # FINAL
    start = 0
    data_website = []
    data_course = []
    data_website_count = 0
    data_course_count = 0
    SERVICE_OFFLINE = "This service is currently unavailable"
    is_service_offline = False
    
    def selected_bridge(self,check_against):
        try:
            return (check_against == self.request.form.get('type',''))
        except: pass
        return False
    
    def get_next_page_url(self):
        url = self.context.absolute_url() + '/find'
        url += '?q='+self.get_query()
        url += '&type=' + self.request.form.get('type','')
        url += '&category=' + self.request.form.get("category","more")
        url += '&start=' + str(int(self.request.form.get("start","0")) + int(self.LIMIT))
        return url
        
    def get_prev_page_url(self):
        url = self.context.absolute_url() + '/find'
        url += '?q='+self.get_query()
        url += '&type=' + self.request.form.get('type','')
        url += '&category=' + self.request.form.get("category","more")
        url += '&start=' + str(int(self.request.form.get("start","0")) - int(self.LIMIT))
        return url
    
    def is_website_only(self):
        return (self.get_search_type() == 'Website' or self.get_search_type() == "Everything")
    
    def is_courses_only(self):
        return (self.get_search_type() == 'Courses' or self.get_search_type() == "Everything")
    
    def get_start(self):
        return int(self.start)
    
    def get_limit(self):
        return int(self.LIMIT)

    def get_search_type(self):
        type = self.request.form.get('type','')
        return type.capitalize()
    
    def get_query(self):
        """ Get Query Parameter """
        return self.request.form.get('q','*') 
    
    def get_total_count(self):
        if self.get_search_type() == 'Website':
            return self.data_website_count
        elif self.get_search_type() == 'Courses':
            return self.data_course_count
        return self.data_course_count + self.data_website_count
    
    def _contruct_query(self):
        """ Places the correct pamameters for the WS """
        q = self.request.form.get('q','*')
        self.start = self.request.form.get('start',self.OFFSET)
        limit = self.request.form.get('limit',self.LIMIT)
        return "q=" + urllib.quote(q) + "&group.limit=" + limit + "&group.offset=" + self.start + "&alt=json"
        
        
    def get_results(self):
        try:
            j = self._connect("select")
            data = simplejson.loads(j)
            groups = data['grouped']['type']['groups']
            for group in groups:
                if group['groupValue'].lower() == "website":
                    self.data_website_count = int(group['doclist']['numFound'])
                    self.data_website = group['doclist']['docs']
                if group['groupValue'].lower() == "course":
                    self.data_course_count = int(group['doclist']['numFound'])
                    self.data_course = group['doclist']['docs']
            self.is_service_offline = False
        except Exception as e:
            logger.error("get_results() in  Courses/Website Search: " + str(e))
            self.data_course, self.data_website = [],[]
            self.is_service_offline = True
        return None
    
    
    def get_course_page_url(self,node):
        url = getToolByName(self.context, 'portal_properties').site_javascript.getProperty('coursepages_url')
        return url + "?psClassNum=" + node['course_id'] + "&termCode=" + self._get_term_code(node['term'])
        
        
    def _get_term_code(self,term):
        """ 
        This is a screwy.  PeopleSoft has this weird formula.  
        @note: this is the same as course pages logic.
        """
        t = term.lower().split(" ")
        code = int(t[1]) - 1945
        termcode = ""

        if   t[0] == "fall":
            termcode += str(code) + "0"
        elif t[0] == "winter":
            termcode += str(code) + "3"
        elif t[0] == "spring":
            termcode = str(code-1) + "5"
        elif t[0] == "summer":
            termcode = str(code-1) + "8"
        else:
            termcode += "?"
            
        if len(termcode) == 3:
            termcode = "0" + termcode
            
        return termcode
        
    def _connect(self,component):
        """ Connect to solr and get response """
        self._connection_setup()
        conn = httplib.HTTPConnection(self.solr_url, self.solr_port)
        conn.request("GET", self.solr_path + "?" + self._contruct_query())
        response = conn.getresponse()
        content = response.read()
        conn.close()
        return content
        
    def _connection_setup(self):
        """ Get Solr Connection Data from Portal Properties """
        url = getToolByName(self.context, 'portal_properties').site_javascript.getProperty('solr_url')
        o = urlparse.urlparse(url)
        self.solr_url =  str(o.hostname).replace("http://", "")
        self.solr_port = o.port
        self.solr_path = o.path
        