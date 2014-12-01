from zope.interface import Interface
from zope.component import getMultiAdapter
from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName
from plone.memoize import ram

from uwosh.librarytheme.browser import util as utils
from uwosh.libraryguides.browser import util as guides_util

from time import time


def cache_purge(method, self, modified):
    return (modified, time() // (60 * 60))


class SubBrowserView(BrowserView, utils.TemplateTools):
    """ Base Class, common functionality used by all browserviews. """
    
    @property
    def portal(self):
        return getToolByName(self.context, 'portal_url').getPortalObject()


class SubViewTabs(SubBrowserView):

    EzProxy = guides_util.EzProxy
    
    def getSubjectGuides(self):
        """ Gets the list of all subjects. """
        return guides_util.getGuidesListingByTags(self.context)
    

    def getAllDatabases(self):
        cache = self.getCache()
        if cache:
            return self.getAllDatabasesCache(cache.modified)
        return []
    
    def getCache(self):
        path = guides_util.getAtoZPath(self.context)
        brains = getToolByName(self.context, 'portal_catalog').searchResults(portal_type='LibraryCache',
                                                                             path={'query':path,'depth':0}, limit=1)
        if brains:
            return brains[0]
        return None
    
    @ram.cache(cache_purge)
    def getAllDatabasesCache(self,modified):
        """ Find's ATOZ cache object, gets all SearchTools. """
        cache_brain = self.getCache()
        if cache_brain:
            cache = cache_brain.getObject().getCache()
            return sorted(cache, key=lambda x: x['title'].lower())
        return []
    
    @ram.cache(lambda *args: time() // (60 * 5))
    def scopes(self):
        s = getToolByName(self.context,'portal_properties').get('primo_scopes')
        return {'everything' : s.getProperty('everything',''),
                'articles' : s.getProperty('articles',''),
                'oshkosh' : s.getProperty('oshkosh',''),
                'all_voyagers' : s.getProperty('all_voyagers',''),
                'digital_collections' : s.getProperty('digital_collections','')
                }
        

class SubViewBreadCrumbs(SubBrowserView):    
    """ This is based off of Plones Default BreadCrumb class, with slight differences """
    
    def update(self):
        breadcrumbs_view = getMultiAdapter((self.context, self.request),
                                           name='breadcrumbs_view')
        self.breadcrumbs = breadcrumbs_view.breadcrumbs()


class SubViewHook(BrowserView):
    """ This hook class allows hand off of data through subviews. """
    def __call__(self, **kwargs):
        for key in kwargs:
            setattr(self, key, kwargs[key])
        return super(SubViewHook, self).__call__()