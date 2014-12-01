from zope.interface import Interface
from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName

from uwosh.librarytheme.browser import util

from DateTime import DateTime
import datetime
from operator import itemgetter

import logging
logger = logging.getLogger("Plone")


class IGuidedKeywords(Interface):
    """ Marker Interface """

class IComputerAvailabilityPage(Interface):
    """ Marker """

class IEMCHomepage(Interface):
    """ Marker """

class IGovernmentHomepage(Interface):
    """ Marker """

class IDistanceEducationHomepage(Interface):
    """ Marker """
    
class TemplateBaseView(BrowserView, util.TemplateTools):
    """
    This class is used by both EMC and Government.  It is a base
    class with common functions.
    """
  
    @property
    def portal(self):
        return getToolByName(self.context, 'portal_url').getPortalObject()


class LibraryHomePage(TemplateBaseView):
    
    def __call__(self):
        self.limit = int(self.request.form.get('limit','15'))
        return super(LibraryHomePage,self).__call__()

    def get_featured_item(self):
        brains = getToolByName(self.context, 'portal_catalog').searchResults(path={'query':util.getFeaturedPath(self.context),'depth':1},
                                                                             portal_type="LibraryLink")
        try:
            i = int(datetime.datetime.now().hour) % (len(brains))
            return brains[i]
        except Exception as e:
            return brains[:1]

    
    """ Manager Functions Below """
    
    def getRootContents(self):
        """ FOR Editors.  Goes 1 Lvl deep and detects if they have Editors capabilities. """
        results = []
        items = self.context.listFolderContents()
        for item in items:
            if self.context.portal_membership.checkPermission('Add portal content', item) or \
               self.context.portal_membership.checkPermission('Modify portal content', item) or \
               self.context.portal_membership.checkPermission('Review portal content', item):
                path = '/'.join(item.getPhysicalPath())
                results.append({'name':item.Title(), 'url':item.absolute_url(),'path':path})
        results = sorted(results,key=itemgetter('name'))
        return {'areas':results,'modified':self.getRecentlyChangedItems(results)}

    def getRecentlyChangedItems(self,results):
        """ FOR Editors.  Shows recently modified content. """
        try:
            pathlist = []
            for item in results:
                pathlist.append(item['path'])
            brains = getToolByName(self.context, 'portal_catalog').searchResults(path=pathlist, sort_on='modified',
                                                                                 sort_order='reverse')
            return brains[:self.limit]
        except Exception as e:
            logger.error(str(e))
            return [] # purely defensive
        
    def formatDate(self,date):
        return DateTime(date).strftime("%m/%d/%Y - %H:%M")
    
    def checkedOutCopy(self,id):
        if id.find("copy_of") == -1:
            return False
        return True
        