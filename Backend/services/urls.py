from django.urls import path

from .views import *

urlpatterns = [
    path("createdivision",createdivision), #create division 
    path("getalldivisions",getalldivisions), #get all divisions 
    path("updatedivision/<int:id>",updatedivision), #update division 
    path("getdivision/<int:id>",getdivision), #get division 
    path("deletedivision/<int:id>",deletedivision), #delete division 
    path("createsubdivision",createsubdivision), #create subdivision 
    path("getallsubdivisions",getallsubdivisions), #get all subdivisions 
    path("updatesubdivision/<int:id>",updatesubdivision), #update subdivision 
    path("getsubdivision/<int:id>",getsubdivision), #get subdivision 
    path("deletesubdivision/<int:id>",deletesubdivision), #delete subdivision 
    path("createbranch",createBranch), #create branch 
    path("getallbranches",getallbranches), #get all branches 
    path("getbranch/<int:id>",getbranch), #get branch 
    path("updatebranch/<int:id>",updatebranch), #update branch 
    path("deletebranch/<int:id>",deletebranch), #delete branch 
    path("createlead",createlead), #create lead 
    path("getallleads", getallleads), #get all status leads 
    path("getlead/<int:id>", getlead), #get one lead as specific  
    path("updatelead/<int:id>", updatelead),# update leads 
    # path("deletelead/<int:id>", deletelead), #delete lead 
    path ("leadlogdetails/<int:id>", leadlogdetails), #lead log details
    path ("allleadlogdetails", allleadlogdetails), #all lead log details
    path("getrawleads", getrawleads), #get raw leads 
    path("getrawleadbyid/<int:id>", getrawleadbyid), #get raw leads by id
    path("getaftervisitleads", getaftervisitleads), #get after visit leads
    path("getaftervisitleadbyid/<int:id>", getaftervisitleadbyid), #get after visit leads by id  
    path("getbeforevisitleads", getbeforevisitleads), #get before visit leads
    path("getbeforevisitleadbyid/<int:id>", getbeforevisitleadbyid), #get before visit leads by id 
    path("getcompletedleads", getcompletedleads), #get completed leads 
    path("getcompletedleadbyid/<int:id>", getcompletedleadbyid), #get completed leads by id
    path("getallcustomers", iscustomer), #get all customers
    path("getcustomerbyid/<int:id>", get_customer_lead_by_id), #get one customer
    path("getallassignleads", getallassignleads), #get all assign leads to that user only
    path("getassignlead/<int:id>", getassignlead), #assign lead to user
    path("getleadsaccordingtouser", get_leads_according_to_user), #get leads according to user
    path("getallfollowup", getallfollowup), #get all followup
    path("followupleadreschedule/<int:id>", followup_lead_reschedule), #followup lead reschedule
    path("getfollowupbyid/<int:id>", getfollowupbyid), #get followup by id
    path("updatefollowup/<int:id>", updatefollowup), #update followup by id
    path("getallcompletedfollowup", getallcompletedfollowup), #get all completed followup
    path("getcompletedfollowupbyid/<int:id>", getcompletedfollowupbyid), #get completed followup by id
    path("getalloverduefollowup", getalloverduefollowup), #get all overdue followup
    path("getoverduefollowupbyid/<int:id>", getoverduefollowupbyid), #get overdue followup by id
    path("getallpendingfollowup", getallpendingfollowup), #get all pending followup
    path("getpendingfollowupbyid/<int:id>", getpendingfollowupbyid), #get pending followup by id
    path("importleads",importleads), #import all leads
    path("exportleads/",export_leads), #export all leads
    ]