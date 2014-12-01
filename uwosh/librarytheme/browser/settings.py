
"""
@note: I am not sure where to go with these classes, I will wait until future dev.
"""

from zope.annotation.interfaces import IAnnotations
from zope.interface import implements, Interface, providedBy
from AccessControl import ClassSecurityInfo

from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName
from Products.statusmessages.interfaces import IStatusMessage

from uwosh.librarytheme.browser.subviews import SubBrowserView
from uwosh.librarytheme.browser.util import TemplateTools

from DateTime import DateTime
from operator import itemgetter

import simplejson
import logging
logger = logging.getLogger("Plone")



class IAllowSiteSettingsTab(Interface):
    """ Add Settings """

class SiteSettingsTab(SubBrowserView,TemplateTools): 
    template = ViewPageTemplateFile('templates/theme/site_settings.pt')
    
    def __call__(self):
        if not self.isEditor():
            self.request.response.redirect(self.context.absolute_url() + '/login_form')
        
        # LibraryHours
        self.lh_override = bool(self.request.form.get('lh_override',False))
        self.lh_message = self.request.form.get('lh_message','')
        
        # Courses & Website
        self.articles_help_text = self.request.form.get('articles_help_text','')
        self.journals_help_text = self.request.form.get('journals_help_text','')
        self.books_help_text = self.request.form.get('books_help_text','')
        self.courses_help_text = self.request.form.get('courses_help_text','')
        self.ctc_termcode = self.request.form.get('ctc_termcode','')

        # Submission
        cache_submission = self.request.form.get('cache_submission','0')
        hours_submission = self.request.form.get('hours_submission','0')
        tabs_submission = self.request.form.get('tabs_submission','0')
        submission = self.request.form.get('submission','0')
        
        if cache_submission == '1':
            self.manage_allCaches()
        elif hours_submission == '1':
            self.manage_libraryHours()
        elif tabs_submission == '1': 
            self.manage_coursesAndWebsite()
        if submission == '1':
            IStatusMessage(self.request).addStatusMessage("Site Settings Saved", type="Success")
            self.request.response.redirect(self.context.absolute_url())

        return self.template()
    
    def prop(self,name):
        return getToolByName(self.context,'portal_properties').get(name,None)
    
    def manage_libraryHours(self):
        try:
            props = self.prop('webservice_properties')
            if props != None:
                props.manage_changeProperties(is_msg_override_on=self.lh_override,
                                              msg_override=self.lh_message)
                # Reindex hours object to purge the ram.cache
                hours_path = self.prop('base_paths').getProperty('base_hours_path')
                brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type='LibraryCache', path={'query':hours_path,'depth':1})
                for brain in brains:
                    cache = brain.getObject()
                    cache.reindexObject()
        except Exception as e:
            logger.error("Error:  def manage_libraryHours() in settings.py, " + str(e))
    
    def manage_coursesAndWebsite(self):
        try:
            props = self.prop('webservice_properties')
            if props != None:
                props.manage_changeProperties(current_term_code=self.ctc_termcode)
            props = self.prop('site_javascript')
            if props != None:
                props.manage_changeProperties(articles_journals_msg=self.articles_help_text,
                                              journals_msg=self.journals_help_text,
                                              books_videos_msg =self.books_help_text,
                                              courses_website_msg=self.courses_help_text)
        except Exception as e:
            logger.error("Error:  def manage_coursesAndWebsite() in settings.py, " + str(e))
    
    def manage_allCaches(self):
        brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type='LibraryCache')
        for brain in brains:
            cache = brain.getObject()
            cache.rebuildCache()
            cache.reindexObject()
        

    
class WarningMessageSystem(SubBrowserView):
    
    template = ViewPageTemplateFile("templates/theme/warning_system.pt")

    def __call__(self):
        form = self.request.form
        setup = form.get('setup','0')
        activate = form.get('lib-activate','')
        submit = form.get('submit','')
            
        if setup == '1':
            wms = WarningMessageSetup(self.request,self.context)
            if not wms.successFullSetup():
                return "Error on setup, check logfile.  Make sure PFG 1.6.0 and uwosh.pfg.d2c 1.0 are installed."
            return self.request.response.redirect(self.context.absolute_url())
        
        if activate != '' and submit == '1':
            self.doPublication(activate)
            IStatusMessage(self.request).addStatusMessage("Site Settings Changed", type="Success")
            return self.request.response.redirect(self.context.absolute_url())
        
        return self.template()

    def getData(self):
        brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type="FormSaveData2ContentEntry",path=self.getPath())
        results = []
        for brain in brains:
            obj = brain.getObject()
            results.append({'id':obj.getId(),'Title':obj.getValue('message-title'),'getURL':brain.getURL(),
                            'showTimeFrame':self.showTimeFrame(obj),'start':self.dateFormat(obj.getValue('start-date')),'end':self.dateFormat(obj.getValue('end-date')),
                            'levelColor':self.getWarningColorStyled(obj),
                            'isActive':brain.review_state
                            })
        results = sorted(results,key=itemgetter('Title'))
        return results
    
    def getWarningColorStyled(self,obj):
        return "background-color:" + self.getWarningColor(obj)
        
    def getWarningColor(self,obj):
        o = obj.getValue('message-type-override')
        if o != "":
            return o
        return obj.getValue('message-type')
    
    def doPublication(self,id):
        brains = getToolByName(self.context,'portal_catalog').searchResults(portal_type="FormSaveData2ContentEntry",path=self.getPath())
        for brain in brains:
            obj = brain.getObject()
            if obj.getId() == id:
                if brain.review_state != 'published':
                    getToolByName(self.context, 'portal_workflow').doActionFor(obj, action='publish')
                    obj.reindexObject()
            else:
                if brain.review_state != 'private':
                    getToolByName(self.context, 'portal_workflow').doActionFor(obj, action='retract')
                    obj.reindexObject()
     
    def showTimeFrame(self,obj):
        s = DateTime(obj.getValue('start-date'))
        e = DateTime(obj.getValue('end-date'))
        if s.year() == e.year() and s.month() == e.month() and \
           s.day() == e.day() and s.hour() == e.hour() and s.minute() == e.minute():
            return False
        return True
    
    def dateFormat(self,date):
        return DateTime(date).strftime("%b. %d, %Y - %H:%M %p")
    
    def getPath(self):
        return getToolByName(self.context, 'portal_properties').base_paths.getProperty('base_site_message_path')
        
    
    def isFormSetup(self):
        try:
            msg = getattr(self.context,'add-message')
            msgt = getattr(msg,'message-title')
            return True
        except:
            return False
    

class WarningMessageSetup:
    
    error = False
    
    def __init__(self,request,context):
        print "INIT SETUP"
        self.context = context
        self.request = request
        self.error = False
        self.setupForm()
     
    def successFullSetup(self):
        return not self.error
        
    def setupForm(self):
        
        try:
            self.context.invokeFactory(type_name="FormFolder",id="add-message",title="Add Message")
            form = getattr(self.context, 'add-message')
            form.manage_delObjects(['mailer','replyto','topic','comments','thank-you'])
            
            
            form.invokeFactory(type_name="FormStringField",id="message-title",title="Message Title")
            title = getattr(form, 'message-title')
            title.setRequired(True)
            
            
            form.invokeFactory(type_name="FormRichTextField",id="message",title="Message")
            message = getattr(form, 'message')
            message.setRequired(True)
            
            
            form.invokeFactory(type_name="FormSelectionField",id="message-type",title="Warning Level")
            type = getattr(form, 'message-type')
            type.setDescription('Determines the color of the message background.');
            type.setFgVocabulary(["darkorange|Moderate (Orange)","#DF0101|High (Red)"])
            type.setFgFormat('select')
        
        
            form.invokeFactory(type_name="FormStringField",id="message-type-override",title="Warning Level Override")
            typeOverride = getattr(form, 'message-type-override')
            typeOverride.setDescription('Use a #FFFFFF style to override the background color to a specific color.');
        
        
            form.invokeFactory(type_name="FormDateField",id="start-date",title="Show Warning At")
            start = getattr(form, 'start-date')
            start.setFgShowHM(True)
            start.setDescription('If the message is activated (published), it will turn on at this time.');
        
            form.invokeFactory(type_name="FormDateField",id="end-date",title="Hide Warning At")
            end = getattr(form, 'end-date')
            end.setFgShowHM(True)
            end.setDescription('If the message is activated (published), it will turn off at this time.');
        
            form.invokeFactory(type_name="FormSaveData2ContentAdapter",id="data",title="Data (D2C)")
            data = getattr(form, 'data')
            
            form.invokeFactory(type_name="FormThanksPage",id="success",title="Success")
            success = getattr(form, 'success')
            success.setThanksPrologue('<p>Created! <a title="Back" href="../">Return to main setup page.</a></p><br /><br />') 
            form.setThanksPage('success')
            

        except Exception as e:
            logger.error(" Site Message Error: " + str(e))
            self.error = True # eh, doesn't need much more than this simple switch.
        
        try:
            bases = getToolByName(self.context, 'portal_properties').base_paths
            bases.manage_addProperty('base_site_message_path',self.context.virtual_url_path(),'string')
        except Exception as e:
            logger.error(" Site Message Add Prop Error: " + str(e))


class WarningMessageEntry(SubBrowserView):

    template = ViewPageTemplateFile("templates/theme/warning.pt")
    
    def __call__(self):
        return self.template()  

    def getMessage(self):
        return str(getattr(self.context,'message'))
    
    
    
    
