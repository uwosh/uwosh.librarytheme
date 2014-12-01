from Products.Archetypes.public import BooleanWidget, BooleanField 
from archetypes.schemaextender.field import ExtensionField
from zope.component import adapts
from zope.interface import implements, Interface
from archetypes.schemaextender.interfaces import ISchemaExtender
from Products.ATContentTypes.interface import IATDocument

class IATDocumentAddStringField(Interface):
    """ Marker """

class BooleanFieldExtension(ExtensionField, BooleanField):
    """A String Marker field."""


class ATDocumentExtension(object):
    adapts(IATDocument)
    implements(ISchemaExtender)

    fields = [BooleanFieldExtension("showDescription",
                                    widget = BooleanWidget(label="Show summary on page?",
                                                           description="Check this box if you would like to show the summary."
                                                           )),
              BooleanFieldExtension("showVideoIcon",
                                    widget = BooleanWidget(label="Show video icon?",
                                                           description="Check this box if this page contains a video.  A video icon will appear next to this page's link in the folder listing display."
                                                           )),
              ]
   
    def __init__(self, context):
        self.context = context
        
    def getFields(self):
        return self.fields
