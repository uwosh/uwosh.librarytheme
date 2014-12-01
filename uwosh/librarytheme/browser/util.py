from zope.interface import Interface,implements
from Products.CMFCore.utils import getToolByName
from Products.Five import BrowserView

from DateTime import DateTime
import json

import logging
logger = logging.getLogger("Site News Limit")

def getServicesPath(context):
    props = getToolByName(context, 'portal_properties')
    return props.base_paths.getProperty('base_services_path')

def getFeaturedPath(context):
    props = getToolByName(context, 'portal_properties')
    return props.base_paths.getProperty('base_featured_path')

def getLibraryPath(context):
    props = getToolByName(context, 'portal_properties')
    return props.base_paths.getProperty('base_library_path')


class ITemplateTool(Interface):
    """ BrowserView Tool, makes available via ZMI """
    def isEditor(self,context=None):
        pass
    
class TemplateTools(object):
    implements(ITemplateTool)

    def isEditor(self,context=None):
        if context == None:
            context = self.context
        if context.portal_membership.checkPermission('Add portal content', context) or \
           context.portal_membership.checkPermission('Modify portal content', context) or \
           context.portal_membership.checkPermission('Review portal content', context):
            return True
        return False

    def shorten_text(self,text,limit=20):
        return text[:limit] + '...' if len(text) > limit else text

    def get_news(self,subjects,limit,context=None,unlimited=False):
        if context == None:
            context = self.context
        subjects = tuple(subjects)
        timespan = getToolByName(self.context, 'portal_properties').get('site_properties').getProperty('news_limit_days',90)
        from_start = DateTime() - timespan
        if unlimited:
            from_start = DateTime('1985-11-19 11:59:00')
        brains = getToolByName(context, 'portal_catalog').searchResults(portal_type='WeblogEntry',
                                                                             Subject=tuple(subjects),
                                                                             sort_on='created',
                                                                             sort_order='descending',
                                                                             review_state='published',
                                                                             created={'query':(from_start,DateTime('2045-11-19 11:59:00')),
                                                                                               'range': 'min:max'}
                                                                             )
        return brains[:limit]


class BuildJavascript(BrowserView):
    """
    Takes Plone Objects and passes them javascript.  I might change this to just making
    a .js file rather then a json call.
    Based on:
        http://blog.mfabrik.com/2011/04/19/passing-dynamic-settings-to-javascript-in-plone/
    """
    
    def __call__(self):
        callback = self.request.form.get('callback','?')
        alt = self.request.form.get('alt','json')
        site_javascript = getToolByName(self.context, 'portal_properties').site_javascript
        webservice_properties = getToolByName(self.context, 'portal_properties').webservice_properties
        
        settings = {'solr_url':site_javascript.getProperty('solr_url',''),
                    'coursepages_url':site_javascript.getProperty('coursepages_url',''),
                    'feedback_msg':site_javascript.getProperty('feedback_msg',''),
                    'everything_msg':site_javascript.getProperty('everything_msg',''),
                    'articles_journals_msg':site_javascript.getProperty('articles_journals_msg',''),
                    'journals_msg':site_javascript.getProperty('journals_msg',''),
                    'books_videos_msg':site_javascript.getProperty('books_videos_msg',''),
                    'courses_website_msg':site_javascript.getProperty('courses_website_msg',''),
                    'autocomplete_delay':site_javascript.getProperty('autocomplete_delay',''),
                    'featured_items':self.getFeaturedContent(),
                    'library_hours_url':site_javascript.getProperty('library_hours_url',''),
                    'current_term_code':webservice_properties.getProperty('current_term_code','')
                   }
    
        self.request.response.setHeader('Content-Type', 'application/json')
        if alt == 'json':
            return json.dumps(settings)
        else:
            return  callback + '(' + json.dumps(settings) + ')'
   
    def getFeaturedContent(self):
        r = []
        brains = getToolByName(self.context, 'portal_catalog').searchResults(path={'query':getFeaturedPath(self.context),'depth':1},portal_type="LibraryLink")
        for brain in brains:
            r.append({'url':brain.getURL(),'image':brain.getURL()+'/imageReference','title':brain.Title,'description':brain.Description})
        return r
   
   
