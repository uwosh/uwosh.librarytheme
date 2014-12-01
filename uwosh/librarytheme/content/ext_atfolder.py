from Products.Archetypes.public import TextField, StringField, BooleanField, RichWidget, LabelWidget, BooleanWidget
from archetypes.schemaextender.field import ExtensionField
from zope.component import adapts
from zope.interface import implements, providedBy, Interface
from archetypes.schemaextender.interfaces import ISchemaExtender, IBrowserLayerAwareExtender
from Products.ATContentTypes.interface import IATFolder


class TextFieldSufExtension(ExtensionField, TextField):
    """A Text Marker field."""

class TextFieldPreExtension(ExtensionField, TextField):
    """A Text Marker field."""
    
class LabelFixExtension(ExtensionField, StringField):
    """A Text Marker field."""

class BooleanFieldExtension(ExtensionField, BooleanField):
    """A String Marker field."""

class ATFolderExtension(object):
    adapts(IATFolder)
    implements(ISchemaExtender)
    
    fields = [BooleanFieldExtension("showDescription",
                                    widget = BooleanWidget(label="Show description of the folder?",
                                                           description="Check this box if you would like to show the description."
                                                           )),
              TextFieldPreExtension("prefixText",
                                    allowable_content_types=tuple(['text/html']),
                                    default_content_type='text/html',
                                    default_output_type='text/x-html-safe',
                                    widget = RichWidget(label="Folder Prefix",
                                                        description="This will be added before the folder contents.  With Folder Contents unchecked, this field can be used for the folder homepage.",
                                                        rows=20
                                                        )),
              BooleanFieldExtension("hideFolderContents",
                                    widget = BooleanWidget(label="Hide folder contents?",
                                                           description="Check this box if you would like to hide the listing of folder contents."
                                                           )),
              TextFieldSufExtension("suffixText",
                                    allowable_content_types=tuple(['text/html']),
                                    default_content_type='text/html',
                                    default_output_type='text/x-html-safe',
                                    widget = RichWidget(label="Folder Suffix",
                                                        description="This will be added after the folder contents.",
                                                        rows=20
                                                        )),
              
              ]

    def __init__(self, context):
        self.context = context
        
    def getFields(self):
        try:
            from Products.PloneFormGen.interfaces.form import IPloneFormGenForm
            if IPloneFormGenForm.providedBy(self.context):
                return [] # This is to ignore PFG Folder which gets included for some reason.
        except: pass
            
        return self.fields
    
