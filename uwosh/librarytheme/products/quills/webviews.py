
from quills.app.browser.weblogview import WeblogArchiveView
from quills.app.browser.weblogview import WeblogView
from quills.app.browser.weblogview import WeblogEntryView
from quills.app.browser.weblogview import TopicView
from Products.CMFCore.utils import getToolByName

import datetime


class Membership:
            
    def getCreatorName(self,name):
        try:
            member = getToolByName(self.context,'portal_membership').getMemberInfo(name)
            fullname =  member['fullname']
            if fullname == "" or fullname == None:
                return name
            return member['fullname']
        except Exception as e:
            pass # Purely Defensive
        return name



class LibraryArchiveView(WeblogArchiveView,Membership):
    """A class with helper methods for use in views/templates.
    """
    months = {'01':'January',
              '02':'February',
              '03':'March',
              '04':'April',
              '05':'May',
              '06':'June',
              '07':'July',
              '08':'August',
              '09':'September',
              '10':'October',
              '11':'November',
              '12':'December'
              }


    def getTitle(self):
        return self.buildTitle()

    def getArchiveFormatted(self):
        results = self.checkYears()
        if len(results) == 0:
            results = self.checkMonths()
        if len(results) == 0:
            results = self.checkDays()
        return results
    
    def checkYears(self):
        results = []
        try:
            #self.context.getSubArchives() already called in template, needs to be called.
            con_y = self.context._years
            for y in con_y:
                url = self.context.absolute_url() + '/' + str(y)
                results.append({'date':y,'url':url})
            return results
        except Exception as e:
            return []
    
    def checkMonths(self):
        results = []
        try:
            #self.context.getSubArchives() already called in template, needs to be called.
            con_m = self.context._months
            for m in con_m:
                url = self.context.absolute_url() + '/' + str(m)
                results.append({'date':self.months[m],'url':url})
            return results
        except Exception as e:
            return []
        
    def checkDays(self):
        results = []
        try:
            #self.context.getSubArchives() already called in template, needs to be called.
            con_d = self.context._days
            month = self.context.month
            year = self.context.year
            for d in con_d:
                url = self.context.absolute_url() + '/' + str(d)
                results.append({'date':self.months[month] + " " + d + ", " + year,'url':url})
            return results
        except Exception as e:
            return []

        
    def buildTitle(self):
        year = ""
        month = ""
        day = ""
        title = "Past News"
        try:
            year = self.context.year
            month = self.context.month
            day = self.context.day
        except Exception as e:
            pass
            
        if day !=  "":
            return title + " - " + self._getMonth(month) + " " + day + ", " + year
        if month != "":
            return title + " - " + self._getMonth(month) + " " + year
        if year != "":
            return title + " - " + year
        return title
        
    def _getMonth(self,number):
        return self.months[number]
        
    def hasFullDate(self):
        try:
            foo = self.context.day
            return True
        except:
            return False
        
        

class LibraryWeblogEntryView(WeblogEntryView,Membership):
    """ """

class LibraryWeblogView(WeblogView,Membership):
    """ """
    
class LibraryTopicView(TopicView,Membership):
    """ """
    
        