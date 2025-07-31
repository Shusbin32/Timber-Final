from django.urls import path

from .views import *

urlpatterns = [
    path("checktoken", checkToken), # checking token expiry
    path("login", adminLogin),# login for all user
    path("logout", logout), #log out
    path("createuser", createuser), #create user
    path("updateuser/<int:id>", updateuser), #update user details 
    path("getusers", get_users), #all users 
    path("allusers",allusers) ,# all user expect admin,
    path("getoneuser/<int:id>", getoneuser), #one user with id
    path("allroles", allroles), #all roles  
    path ("createroles",createroles), #create role
    path("updaterole/<int:id>", updateroles), #update role 
    path("deleterole/<int:id>",deleteroles), #delete roles
    path("createdealer",createDealer), #create dealer
    path("getdealers",getDealers), #get all dealers
    path("getdealer/<int:id>",getDealer), #get dealer with id
    path("updatedealer/<int:id>",updateDealer), #update dealer with id
    path("deletedealer/<int:id>",deleteDealer), #delete dealer with id

]
