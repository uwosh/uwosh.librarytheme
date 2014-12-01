from zope.i18nmessageid import MessageFactory
from plone.theme.interfaces import IDefaultPloneLayer

# Define a message factory for when this product is internationalised.
# This will be imported with the special name "_" in most modules. Strings
# like _(u"message") will then be extracted by i18n tools for translation.

librarythemeMessageFactory = MessageFactory('uwosh.librarytheme')

def initialize(context):
    """Initializer called when used as a Zope 2 product."""