
"""
@note: I am not sure where to go with this class, the template should be broken
apart... I will wait until future dev.
"""

from zope.annotation.interfaces import IAnnotations
from zope.interface import implements, Interface, providedBy
from AccessControl import ClassSecurityInfo

from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName

from uwosh.librarytheme.browser.subviews import SubBrowserView
from uwosh.librarytheme.browser.util import TemplateTools

import logging
logger = logging.getLogger("Plone")


class IAllowFeaturedBooks(Interface):
    """ Add Books """

class IAllowFeaturedWebsites(Interface):
    """ Add Websites """
    
""" Add different markers for different code. """
 
class FeaturedView(SubBrowserView,TemplateTools):
    
    @property
    def UNIQUE_KEY(self):
        return "uwosh.librarytheme.featured.data." + self.context.getId()
    
    @property
    def get_data(self):
        annotations = IAnnotations(self.context)
        return annotations[self.UNIQUE_KEY]

    def has_data(self,criteria):
        annotations = IAnnotations(self.context)
        try:
            blah = annotations[self.UNIQUE_KEY][criteria]
            return True
        except:
            return False
    
    def allow_books(self):
        return IAllowFeaturedBooks.providedBy(self.context)
    
    def allow_website(self):
        return IAllowFeaturedWebsites.providedBy(self.context)
        

class FeaturedTab(FeaturedView): 
    template = ViewPageTemplateFile('templates/featured/featured.pt')
    
    f_title = "Empty"
    f_description = "Empty"
    f_url = "Empty"
    b_bibid = "Empty"
    b_title = "Empty"
    b_author = "Empty"
    b_location = "Empty"
    b_isbn = "Empty"
    s_base_path = "Empty"
    
    def __call__(self):
        if not self.isEditor():
            self.request.response.redirect(self.context.absolute_url() + '/login_form')
        
        try:
            bib = int(self.request.form.get('bib-data',None))
        except:
            bib = None
        
        # Book
        self.b_bibid = self.request.form.get('b-bibid','')
        self.b_title = self.request.form.get('b-title','')
        self.b_author = self.request.form.get('b-author','')
        self.b_location = self.request.form.get('b-location','')
        self.b_isbn = self.request.form.get('b-isbn','')
        
        # Website or DB
        self.f_url = self.request.form.get('website-url','')
        self.f_title = self.request.form.get('website-title','')
        self.f_description = self.request.form.get('website-desc','')
        
        # Settings
        self.s_base_path = self.request.form.get('settings-bath-path','')
        
        # Submission
        submission = self.request.form.get('submission','0')
        
        if submission == '1':
            self.save_data()
            self.request.response.redirect(self.context.absolute_url() + '/edit_featured')

        
        return self.template()
    
    
    def save_data(self):
        annotations = IAnnotations(self.context)
        annotations[self.UNIQUE_KEY] = {'website':self._get_featured_website_data(self.f_url),
                                        'book':self._get_featured_book_data(),
                                        'settings':self._get_featured_settings(),
                                        }
    
    def _get_featured_book_data(self):
        return {'Title':self.b_title,'author':self.b_author,
                'ISBN':self.b_isbn,'location':self.b_location,'bibid':self.b_bibid}
    
    def _get_featured_website_data(self,url):
        return {'Title':self.f_title,'Description':self.f_description,'getURL':url}
    
    def _get_featured_settings(self):
        return {'website_base_path':self.s_base_path}

    def getWebsiteLinkObjects(self):
        results,s = [],{}
        try:
            brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type='LibraryLink',
                                                                                path={'query':self.get_data['settings']['website_base_path'],'depth':10000},
                                                                                sort_on='sortable_title',
                                                                                )
            for brain in brains:
                if not s.has_key(brain.Title):
                    results.append({'Title':brain.Title,'getURL':brain.getURL()})
                    s[brain.Title] = brain.Title
        except Exception as e: print str(e)
        return results
        