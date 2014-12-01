from Products.CMFCore.utils import getToolByName

default_profile = 'profile-uwosh.librarytheme:default'

def upgrade(upgrade_product,version):
    """ Decorator for updating the QuickInstaller of a upgrade """
    def wrap_func(fn):
        def wrap_func_args(context,*args):
            p = getToolByName(context,'portal_quickinstaller').get(upgrade_product)
            setattr(p,'installedversion',version)
            return fn(context,*args)
        return wrap_func_args
    return wrap_func


def upgrade_init(context):
    """ Warning """
    print "<<< WARNING >>>"
    print "No upgrade steps before 0.2.3b." 

def upgrade_no_change(context):
    """ Default, nothing changes """


@upgrade('uwosh.librarytheme','0.2.4b')
def upgrade_to_0_2_4b(context):
    context.runImportStepFromProfile(default_profile, 'propertiestool')
    context.runImportStepFromProfile(default_profile, 'viewlets')
    context.runImportStepFromProfile(default_profile, 'jsregistry')
    context.runImportStepFromProfile(default_profile, 'cssregistry')
    
@upgrade('uwosh.librarytheme','0.2.4b')
def upgrade_to_0_2_5b(context):
    context.runImportStepFromProfile(default_profile, 'jsregistry')

@upgrade('uwosh.librarytheme','0.2.6b')
def upgrade_to_0_2_6b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.2.7b')
def upgrade_to_0_2_7b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.2.9b')
def upgrade_to_0_2_9b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.0b')
def upgrade_to_0_3_0b(context):
    context.runImportStepFromProfile(default_profile, 'jsregistry')
    
@upgrade('uwosh.librarytheme','0.3.1b')
def upgrade_to_0_3_1b(context):
    context.runImportStepFromProfile(default_profile, 'jsregistry')
    
@upgrade('uwosh.librarytheme','0.3.2b')
def upgrade_to_0_3_2b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.3b')
def upgrade_to_0_3_3b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.4b')
def upgrade_to_0_3_4b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.5b')
def upgrade_to_0_3_5b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.6b')
def upgrade_to_0_3_6b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.7b')
def upgrade_to_0_3_7b(context):
    print "Upgrading"

@upgrade('uwosh.librarytheme','0.3.8b')
def upgrade_to_0_3_8b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.9b')
def upgrade_to_0_3_9b(context):
    context.runImportStepFromProfile(default_profile, 'viewlets')
    print "Upgrading"

@upgrade('uwosh.librarytheme','0.3.10b')
def upgrade_to_0_3_10b(context):
    context.runImportStepFromProfile(default_profile, 'viewlets')
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.11b')
def upgrade_to_0_3_11b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.12b')
def upgrade_to_0_3_12b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.13b')
def upgrade_to_0_3_13b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.14b')
def upgrade_to_0_3_14b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.15b')
def upgrade_to_0_3_15b(context):
    print "Upgrading"    
    
@upgrade('uwosh.librarytheme','0.3.16b')
def upgrade_to_0_3_16b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.17b')
def upgrade_to_0_3_17b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.18b')
def upgrade_to_0_3_18b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.19b')
def upgrade_to_0_3_19b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.20b')
def upgrade_to_0_3_20b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.21b')
def upgrade_to_0_3_21b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.22b')
def upgrade_to_0_3_22b(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.23b')
def upgrade_to_0_3_23b(context):
    print "Upgrading"

@upgrade('uwosh.librarytheme','0.3.24')
def upgrade_to_0_3_24(context):
    print "Upgrading"

@upgrade('uwosh.librarytheme','0.3.25')
def upgrade_to_0_3_25(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.26')
def upgrade_to_0_3_26(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.3.27')
def upgrade_to_0_3_27(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.4.0')
def upgrade_to_0_4_0(context):
    print "Upgrading"
    
@upgrade('uwosh.librarytheme','0.4.1')
def upgrade_to_0_4_1(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.2')
def upgrade_to_0_4_2(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.3')
def upgrade_to_0_4_3(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.4')
def upgrade_to_0_4_4(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.5')
def upgrade_to_0_4_5(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.6')
def upgrade_to_0_4_6(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.7')
def upgrade_to_0_4_7(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.8')
def upgrade_to_0_4_8(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.9')
def upgrade_to_0_4_9(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.10')
def upgrade_to_0_4_10(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.11')
def upgrade_to_0_4_11(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.12')
def upgrade_to_0_4_12(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.13')
def upgrade_to_0_4_13(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.14')
def upgrade_to_0_4_14(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.15')
def upgrade_to_0_4_15(context):
    print "Upgrading" 
    
@upgrade('uwosh.librarytheme','0.4.16')
def upgrade_to_0_4_16(context):
    print "Upgrading"     
    
@upgrade('uwosh.librarytheme','0.4.17')
def upgrade_to_0_4_17(context):
    print "Upgrading"     
    
@upgrade('uwosh.librarytheme','0.4.18')
def upgrade_to_0_4_18(context):
    print "Upgrading"     
    
@upgrade('uwosh.librarytheme','0.4.19')
def upgrade_to_0_4_19(context):
    print "Upgrading"    
    
@upgrade('uwosh.librarytheme','0.4.20')
def upgrade_to_0_4_20(context):
    print "Upgrading"    
    
@upgrade('uwosh.librarytheme','0.4.21')
def upgrade_to_0_4_21(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.22')
def upgrade_to_0_4_22(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.23')
def upgrade_to_0_4_23(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.24')
def upgrade_to_0_4_24(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.25')
def upgrade_to_0_4_25(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.26')
def upgrade_to_0_4_26(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.27')
def upgrade_to_0_4_27(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.28')
def upgrade_to_0_4_28(context):
    print "Upgrading"  

@upgrade('uwosh.librarytheme','0.4.29')
def upgrade_to_0_4_29(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.30')
def upgrade_to_0_4_30(context):
    print "Upgrading"  
  
@upgrade('uwosh.librarytheme','0.4.31')
def upgrade_to_0_4_31(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.32')
def upgrade_to_0_4_32(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.33')
def upgrade_to_0_4_33(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.34')
def upgrade_to_0_4_34(context):
    print "Upgrading"  

@upgrade('uwosh.librarytheme','0.4.35')
def upgrade_to_0_4_35(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.36')
def upgrade_to_0_4_36(context):
    context.runImportStepFromProfile(default_profile, 'skins')
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.37')
def upgrade_to_0_4_37(context):
    print "Upgrading"  
    
@upgrade('uwosh.librarytheme','0.4.38')
def upgrade_to_0_4_38(context):
    context.runImportStepFromProfile(default_profile, 'skins')
    print "Upgrading"  
    
    
    
    
    
    
    
    
    
    
    