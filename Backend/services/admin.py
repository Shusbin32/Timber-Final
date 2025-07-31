from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Lead)
admin.site.register(LeadLog)
admin.site.register(Division)
admin.site.register(SubDivision)
admin.site.register(Branch)
admin.site.register(AssignToUser)
admin.site.register(Followup)
