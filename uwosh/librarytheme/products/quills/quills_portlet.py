from quills.app.portlets import quillslinks
from lxml import etree
from lxml import html
from Products.CMFCore.utils import getToolByName

class Renderer(quillslinks.Renderer):

    LIBRARY_PORTLET_TITLE = "New Feeds"

    @property
    def title(self):
        return self.LIBRARY_PORTLET_TITLE

