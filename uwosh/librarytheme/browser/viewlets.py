from plone.app.layout.viewlets.common import ViewletBase
from Products.CMFCore.utils import getToolByName

from uwosh.librarytheme.browser.util import TemplateTools

from DateTime import DateTime

import logging
logger = logging.getLogger("Plone")


class ViewletBaseTemplate(ViewletBase,TemplateTools):
    """ Base functionality for all other viewlets. """

    @property
    def portal(self):
        return getToolByName(self.context, 'portal_url').getPortalObject()


class MaintenanceViewlet(ViewletBaseTemplate):
    """
    Class for site message which appears at the top of the website.
    """
    message = None
    
    def __init__(self, context, request, view, manager=None):
        super(ViewletBaseTemplate,self).__init__(context, request, view, manager=manager)
        self.message = None

        path = getToolByName(self.context,'portal_properties').get('base_paths').getProperty('base_site_message_path','')
        brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type='FormSaveData2ContentEntry',
                                                                            path=path, review_state='published')
        if len(brains) > 0:
            active_message = brains[0].getObject()
            s = active_message.getValue('start-date')
            e = active_message.getValue('end-date')
            if ((s == e) or (DateTime().greaterThan(DateTime(s)) and DateTime().lessThan(DateTime(e)))):
                self.message = active_message
    
    def get_warning_color(self):
        override_color = self.message.getValue('message-type-override')
        if not override_color:
            return "background-color:" + self.message.getValue('message-type')
        return "background-color:" + override_color
    
    
class FeedbackViewlet(ViewletBaseTemplate):
    """
    Viewlet for Suggestion/Feedback on footer of the site.  The base_suggestion_path must target exactly the PFG.
    """
    
    def has_suggestion_form(self):
        try:
            path = getToolByName(self.context, 'portal_properties').get('base_paths').getProperty('base_suggestion_path','')
            brains = getToolByName(self.context, 'portal_catalog').searchResults(portal_type='FormFolder', path={'query':path,'depth':0})
            return bool(brains)
        except:
            return False

    
    
    