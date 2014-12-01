from zope.interface import implements

from Products.CMFCore.utils import getToolByName

from plone.app.portlets.portlets import base
from plone.portlets.interfaces import IPortletDataProvider

from zope import schema
from zope.formlib import form
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from uwosh.librarytheme import librarythemeMessageFactory as _

from uwosh.libraryguides.browser import util

from DateTime import DateTime
import htmlentitydefs
import datetime

from operator import itemgetter

import logging
logger = logging.getLogger("Plone")


class IMyLibrary(IPortletDataProvider):
    """
    Notes: 
    1. The ${root_url} will map to the Plone Site Root.
    2. Text Field is being used like a Lines Field, since Lines field doesn't exist in portlets.
    
    """
    student_guide_link = schema.TextLine(title=_(u"Student Guide URL"),
                                         description=_(u"Place url to Student Guide.  Note: ${root_url} allowed."),
                                         required=False,
                                         default=u"${root_url}/community/students")
    student_body_links = schema.Text(title=_(u"Student Guide Links"),
                                     description=_(u"Please use format 'Title|URL' per line.  Note: ${root_url} allowed."),
                                     required=False,
                                     default=u"")
    
    graduate_guide_link = schema.TextLine(title=_(u"Graduate Guide URL"),
                                          description=_(u"Place url to Graduate Student Guide.  Note: ${root_url} allowed."), 
                                          required=False,
                                          default=u"${root_url}/community/graduates")
    graduate_body_links = schema.Text(title=_(u"Graduate Guide Links"),
                                      description=_(u"Please use format 'Title|URL' per line.  Note: ${root_url} allowed."), 
                                      required=False,
                                      default=u"")
    
    faculty_guide_link = schema.TextLine(title=_(u"Faculty and Staff Guide URL"),
                                         description=_(u"Place url to Faculty and Staff Guide.  Note: ${root_url} allowed."),
                                         required=False,
                                         default=u"${root_url}/community/faculty-and-staff")
    faculty_body_links = schema.Text(title=_(u"Faculty and Staff Guide Links"),
                                     description=_(u"Please use format 'Title|URL' per line.  Note: ${root_url} allowed."),
                                     required=False,
                                     default=u"")
    
    visitor_guide_link = schema.TextLine(title=_(u"Visitor and Alumni Guide URL"),
                                           description=_(u"Place url to Visitor and Alumni Guide.  Note: ${absolute_url} allowed."), 
                                           required=False,
                                           default=u"${root_url}/community/alumni-and-visitors")
    visitor_body_links = schema.Text(title=_(u"Visitor and Alumni  Guide Links"),
                                       description=_(u"Please use format 'Title|URL' per line.  Note: ${root_url} allowed."), 
                                       required=False,
                                       default=u"")
    
    news_limit_aud = schema.Int(title=_(u"How many news items to show in Audience area?"),
                            description=_(u"Please specify an integer."), 
                            required=True, 
                            default=1)
    
    news_limit_sub = schema.Int(title=_(u"How many news items to show in Subjects area?"),
                            description=_(u"Please specify an integer."), 
                            required=True, 
                            default=1)
    
    news_timespan = schema.Int(title=_(u"How many days should this news items be visible in this portlet?"),
                               description=_(u"Please specify an integer."), 
                               required=True, 
                               default=60)
    
    journals_limit = schema.Int(title=_(u"How many research databases to show?"),
                                description=_(u"Please specify an integer.  Note: This is Article Resources from Course Pages"),
                                required=True,
                                default=3)
    
    primary_sources_limit = schema.Int(title=_(u"How many books to show?"),
                                       description=_(u"Please specify an integer.  Note: This is Book Resources from Course Pages"),
                                       required=True, 
                                       default=1)
    
    books_limit = schema.Int(title=_(u"How many primary sources to show?"),
                             description=_(u"Please specify an integer.  Note: This is Primary Source Resources from Course Pages"),
                             required=True, 
                             default=1)
    
    references_limit = schema.Int(title=_(u"How many Background and References to show?"),
                                  description=_(u"Please specify an integer.  Note: This is Background and Reference Resource from Course Pages"),
                                  required=True, 
                                  default=0)
    
    gov_limit = schema.Int(title=_(u"How many Government Information Links to show?"),
                                  description=_(u"Please specify an integer.  Note: This is the Government Links."),
                                  required=True, 
                                  default=0)

    emc_limit = schema.Int(title=_(u"How many EMC Links to show?"),
                                  description=_(u"Please specify an integer.  Note: This is the EMC Links."),
                                  required=True, 
                                  default=0)
    
    arc_limit = schema.Int(title=_(u"How many Archives Links to show?"),
                                  description=_(u"Please specify an integer.  Note: This is the Archives Links."),
                                  required=True, 
                                  default=0)

class Assignment(base.Assignment):
    """Portlet assignment.

    This is what is actually managed through the portlets UI and associated
    with columns.
    """

    implements(IMyLibrary)

    def __init__(self,**kwargs):
        self.student_guide_link = kwargs.get('student_guide_link','')
        self.student_body_links = kwargs.get('student_body_links','')
        self.graduate_guide_link = kwargs.get('graduate_guide_link','')
        self.graduate_body_links = kwargs.get('graduate_body_links','')
        self.faculty_guide_link = kwargs.get('faculty_guide_link','')
        self.faculty_body_links = kwargs.get('faculty_body_links','')
        self.visitor_guide_link = kwargs.get('visitor_guide_link','')
        self.visitor_body_links = kwargs.get('visitor_body_links','')
        self.news_limit_sub = kwargs.get('news_limit_sub',1)
        self.news_limit_aud = kwargs.get('news_limit_aud',1)
        self.news_timespan = kwargs.get('news_timespan',60)
        self.journals_limit = kwargs.get('journals_limit',3)
        self.primary_sources_limit = kwargs.get('primary_sources_limit',1)
        self.books_limit = kwargs.get('books_limit',1)
        self.references_limit = kwargs.get('references_limit',0)
        self.gov_limit = kwargs.get('gov_limit',0)
        self.emc_limit = kwargs.get('emc_limit',0)
        self.arc_limit = kwargs.get('arc_limit',0)

    @property
    def title(self):
        """This property is used to give the title of the portlet in the
        "manage portlets" screen.
        """
        return _(u"My Library")


class Renderer(base.Renderer):

    render = ViewPageTemplateFile('my_library.pt')
    
    guide = None
    cache = None
    has_reference_and_background = False
    
    # Default
    librarianInfo = {'id':'1',
                     'name':'Polk 101 Librarian',
                     'phone':'920-424-4333',
                     'email':'infodesk@uwosh.edu',
                     'filename':'polk101.jpg',
                     'created':'2008-11-13 16:00:05',
                     'modified':'2008-11-13 16:00:05'
                     }
                     
    EzProxy = util.EzProxy 
    
    def __init__(self, context, request, view, manager, data):
        base.Renderer.__init__(self, context, request, view, manager, data)
        form = request.form
        submitted = form.get('submit', False)
        
        if submitted == "Clear":
            self.clear_cookies()
            self.request.response.redirect(self.context.absolute_url())
        elif submitted == "Show Quick Links" and not self.cookies_exist():
            if self.checkGroups():
                self.request.response.setCookie("audience", form.get("audience",""),path="/")
            self.request.response.setCookie("subject", form.get("subject",""),path="/")
            self.request.response.redirect(self.context.absolute_url())
            
    def previous(self, name, check_against):
        try:
            return (check_against == self.request[name])
        except: pass
        return False
        


    def cookies_exist(self):
        return True if self.request.cookies.get("audience", "") != "" else False

    def clear_cookies(self):
        self.request.response.setCookie("past_audience",self.getGroupSetting(),path="/")
        self.request.response.setCookie("past_subject",self.getGuideSetting(),path="/")
        self.request.response.setCookie("audience","",path="/")
        self.request.response.setCookie("subject","",path="/")

    def get_guide_setting(self):
        return self.request['subject']
    
    def get_audence_setting(self):
        return self.request['audience']

    def get_subjects(self):
        return getToolByName(self.context, 'portal_catalog').searchResults(portal_type='LibrarySubjectGuide')

    def get_subject_path(self):
        return getToolByName(self.context, 'portal_properties').base_paths.getProperty('base_guide_path','/')












    def getContext(self):
        """ Get/Set Guide Context and Cache Context """
        query = util.getGuidesPath(self)+"/"+str(self.getGuideSetting()).lower()
        brains = getToolByName(self.context, 'portal_catalog').searchResults(portal_type=('LibrarySubjectGuide','LibraryCache'),
                                                                             path={'query':query})
        for brain in brains:
            if brain.portal_type == "LibrarySubjectGuide":
                obj = brain.getObject()
                self.guide = obj
            if brain.portal_type == "LibraryCache":
                obj = brain.getObject()
                self.cache = obj
                self.librarianInfo = obj.getCache()['librarian']
    
    def getLibrarianName(self):
        return self.librarianInfo['name']

    def hasGuideContent(self):
        return (self.guide != None)
    
    def hasArticleContent(self):
        return (self.cache != None)

    
    def getArticleContent(self):
        journals_l,sources_l,books_l = [],[],[];
        self.has_reference_and_background = False
        
        if self.hasArticleContent():
            articles = self.cache.getCache()['departmentsRef']
            results = sorted(articles,key=itemgetter('subsection','index'))
            for row in results:
                if row['exclude_from_guides'] == 0:
                    if row['section'] == 2:
                        books_l.append(row)
                    elif row['section'] == 3:
                        journals_l.append(row)
                    elif row['section'] == 4:
                        sources_l.append(row)
                    elif row['section'] == 1:
                        self.has_reference_and_background = True
        return self._safe_pop(journals_l,0,self.data.journals_limit) + self._safe_pop(books_l,0,self.data.books_limit) + \
               self._safe_pop(sources_l,0,self.data.primary_sources_limit)
    
    def _safe_pop(self,lists,start,end):
        """ Safely pop lists, even if empty """
        try:
            if len(lists) >= end:
                return lists[start:end]
            else:
                return lists[start:len(lists)]
        except:
            return []

    def shortenText(self,text,length=23):
        if len(text) < length:
            return text
        else:
            return text[0:length] + "..."
    
    def hasBooks(self):
        return (len(self.cache.getCache()['voyager']) > 0)
    
    def getBooksDesc(self):
        return self.cache.getCache()['callrange_description']
    
    def getBooksRange(self):
        return self.cache.getCache()['callrange']
    
    def getJournals(self):
        journals = self.guide.getJournalListings()
        self.hasJournals = False
        if len(journals) > 0:
            self.hasJournals = True
        return journals
    
    def ifHasThenGetGovernment(self):
        return "" if not self.guide.getGovernmentMoreContent() else self.enforceRelativeLinksToAbsolute(self.guide.getGovernmentMoreContent())

    def getAllGovLinks(self):
        return self.queryLinkObjects(list(self.guide.getGovernmentListContent()))[:self.data.gov_limit]

    def ifHasThenGetEMC(self):
        return "" if not self.guide.getEMCMoreContent() else self.enforceRelativeLinksToAbsolute(self.guide.getEMCMoreContent())

    def getAllEMCLinks(self):
        return self.queryLinkObjects(list(self.guide.getEMCListContent()))[:self.data.emc_limit]

    def ifHasThenGetArchives(self):
        return "" if not self.guide.getArchivesMoreContent() else self.enforceRelativeLinksToAbsolute(self.guide.getArchivesMoreContent())

    def getAllArchivesLinks(self):
        return self.queryLinkObjects(list(self.guide.getArchivesListContent()))[:self.data.arc_limit]

    def enforceRelativeLinksToAbsolute(self,link):
        if link.find("../") == -1:
            return link
        l = link.replace("../","")
        return self.portalAbsolute() + '/' + l

    def queryLinkObjects(self,queries):
        results = []
        for query in queries:
            if query != "None":
                brains = getToolByName(self.context, 'portal_catalog').searchResults(path=query)
                if len(brains) > 0:
                    results.append(brains[0])
        return results


    def getSubNews(self):
        time_limit = DateTime() - self.data.news_timespan
        return util.LibraryNewsDAO(self.context).get(subject=self.getNewsTopic(),limit=self.data.news_limit_sub,from_date=time_limit)
    
    def getAudNews(self):
        time_limit = DateTime() - self.data.news_timespan
        return util.LibraryNewsDAO(self.context).get(subject=self.getAudienceNewsTag(),limit=self.data.news_limit_aud,from_date=time_limit)
    
    def getNewsTopic(self):
        return self.guide.getNewsTopic()
    
    def getAudienceData(self,type):
        """ Wouldn't have to do this if schema.list worked like you'd think it should... """
        content = getattr(self.data,type)
        results = []
        for c in self._transform_text_to_list(content):
            parts = c.split('|')
            results.append({'Title':self._setup_root_urls(parts[0]),'getURL':self._setup_root_urls(parts[1])})
        return results

    def getAudienceHeader(self,type):
        content = getattr(self.data,type)
        return self._setup_root_urls(content)
    
    def _transform_text_to_list(self,text):
        if text is not None and text is not '':
            text = text.replace('\r','')
            lines = text.split('\n')
            if lines[-1] == '':
                return lines[:-1]
            return lines
        return []
        
    def _setup_root_urls(self,text):
        return text.replace('${root_url}',self.portalAbsolute())

    def checkGroups(self):
       return ( self.isStudent() or 
                self.isGraduate() or 
                self.isFaculty() or 
                self.isVisitor() or
                self.isAlum())
       
    def isStudent(self):
        return ("student" == self.getGroupSetting())

    def isGraduate(self):
        return ("graduate" == self.getGroupSetting())

    def isFaculty(self):
        return ("faculty" == self.getGroupSetting())

    def isVisitor(self):
        return ("visitor" == self.getGroupSetting())

    def isAlum(self):
        return ("alumni" == self.getGroupSetting())
    
    def getAudienceNewsTag(self):
        if self.isStudent():
            return "Students"
        if self.isGraduate():
            return "Graduate Students"
        if self.isFaculty():
            return "Instructors"
        if self.isVisitor():
            return tuple(["Visitors","Alumni"])
        
    def getAudienceNewsLink(self):
        if self.isStudent():
            return "news/topics/Students"
        if self.isGraduate():
            return "news/topics/Graduate Students"
        if self.isFaculty():
            return "news/topics/Instructors"
        if self.isVisitor():
            return "news" # we can't target Visitor and Alumni...
    
    def past_subject(self,check_against):
        try:
            return (check_against == self.request['pguide'])
        except: pass
        return False
        
    def past_group(self,check_against):
        try:
            return (check_against == self.request['pgroup'])
        except: pass
        return False
        
    def portal(self):
        return getToolByName(self.context, 'portal_url').getPortalObject()

    def portalAbsolute(self):
        return self.portal().absolute_url()
    

class AddForm(base.AddForm):
    """Portlet add form.

    This is registered in configure.zcml. The form_fields variable tells
    zope.formlib which fields to display. The create() method actually
    constructs the assignment that is being added.
    """
    form_fields = form.Fields(IMyLibrary)

    def create(self, data):
        assignment = Assignment()
        form.applyChanges(assignment, self.form_fields, data)
        return assignment


class EditForm(base.EditForm):
    """Portlet edit form.

    This is registered with configure.zcml. The form_fields variable tells
    zope.formlib which fields to display.
    """
    form_fields = form.Fields(IMyLibrary)
