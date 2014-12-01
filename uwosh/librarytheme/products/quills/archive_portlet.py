from quills.app.portlets import archive
from lxml import etree
from lxml import html
from Products.CMFCore.utils import getToolByName

class Renderer(archive.Renderer):

    LIBRARY_PORTLET_TITLE = "Past News"

    @property
    def title(self):
        return self.LIBRARY_PORTLET_TITLE

