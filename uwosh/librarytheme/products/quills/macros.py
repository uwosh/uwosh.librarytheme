"""Provide access to Quills' metal macros."""

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

class Macros(BrowserView):
    def __getitem__(self, key):
        return self.template.macros[key]


class HeaderMacros(Macros):
    template = ViewPageTemplateFile('quills_header_macros.pt')

class WeblogEntryMacros(Macros):
    template = ViewPageTemplateFile('quills_entry_macros.pt')
    
    def force_excerpt(self,entry,limit=300):
        text = entry.getObject().getText(mimetype='text/plain')
        return text[:limit] + '...' if len(text) > limit else text

class WeblogMacros(Macros):
    template = ViewPageTemplateFile('quills_weblog_macros.pt')
