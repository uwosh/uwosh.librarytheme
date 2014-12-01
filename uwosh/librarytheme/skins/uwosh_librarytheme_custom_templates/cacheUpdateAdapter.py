## Script (Python) "cacheUpdateAdapter"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=
##title=
##

request = container.REQUEST
response =  request.response
from DateTime import DateTime

now = DateTime()
cache = DateTime(context.modified())

# Get out of here...
if context.portal_type != 'LibraryCache':
    return "STOPPED!!! - " + str(now)+ " - " + context.virtual_url_path()

# check
if cache.day() < now.day() or cache.month() < now.month() or cache.year() < now.year():
    context.rebuildCache()
    return "UPDATED - " + str(context.modified()) + " - " + str(DateTime())
    #return "" # dont return anything, just builds up log file.

return "PASSING - " + str(cache) + " < " + str(now) + " - " + context.virtual_url_path()

