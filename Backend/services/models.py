from django.db import models
from user.views import *
from user.models import *


class Division(models.Model):
    division_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

class SubDivision(models.Model):
    subdivision_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='subdivisions', null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

class Branch(models.Model):
    branch_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

class Lead(models.Model):
    lead_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200)
    contact= models.BigIntegerField(null=True)
    address = models.CharField(null=True)
    email = models.EmailField(null=True)
    gender = models.CharField(max_length=20, choices=[("male", "Male"), ("female", "Female")])
    city = models.CharField(null=True)
    landmark = models.CharField(null=True)
    lead_type = models.CharField(null=True, max_length=120, choices=[("raw","Raw"),("before visit","Before Visit"),("completed","Completed"),("after visit","After Visit")])
    source = models.CharField(null=True, max_length=120)
    category = models.CharField(null=True, max_length=120)
    pan_vat = models.CharField(null=True, max_length=120)
    company_name = models.CharField(null=True, max_length=120)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='leads', null=True)
    subbranch = models.CharField(null=True, max_length=150)
    tentetive_visit_date = models.DateTimeField(null=True)
    tentetive_purchase_date = models.DateTimeField(null=True)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='leads', null=True)
    subdivision = models.ForeignKey(SubDivision, on_delete=models.CASCADE, related_name='leads', null=True)
    assign_to = models.ForeignKey('user.Users', on_delete=models.CASCADE, related_name='leads', null=True)
    created_by = models.ForeignKey('user.Users', on_delete=models.CASCADE, related_name='created_leads', null=True)
    is_customer = models.BooleanField(default=False, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    def save(self, *args, **kwargs):
        if self.pk:  # Updating existing record
            old = Lead.objects.get(pk=self.pk)
            # If is_customer changed to True, force lead_type to 'completed'
            if not old.is_customer and self.is_customer:
                self.lead_type = 'completed'
            # If already a customer, prevent changes to lead_type
            elif old.is_customer:
                self.lead_type = old.lead_type
        else:  # Creating a new record
            if self.is_customer:
                self.lead_type = 'completed'
        super(Lead, self).save(*args, **kwargs)               

    def __str__(self):
        return f"User Name :{self.name, self.address}"


class AssignToUser(models.Model):
    assigntouser = models.AutoField(primary_key=True, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='assign_to_users', null=True)
    user = models.ForeignKey('user.Users', on_delete=models.CASCADE, related_name='assigned_leads', null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"Lead {self.lead} assigned to {self.user}"
 
class Followup(models.Model):
    followup_id = models.AutoField(primary_key=True, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='followups', null=True)
    user = models.ForeignKey('user.Users', on_delete=models.CASCADE, related_name='followups', null=True)
    followup_date = models.DateTimeField(null=True)
    followup_type = models.CharField(null=True, max_length=120, choices=[("overdue","Overdue"),
    ("pending","Pending"),("completed","Completed"), ])
    followup_remarks = models.TextField(null=True)
    entry_date = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"Followup {self.lead} by {self.user}"
    
class LeadLog(models.Model):
    leadlog_id = models.AutoField(primary_key=True, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='lead_logs', null=True)
    user = models.ForeignKey('user.Users', on_delete=models.CASCADE, related_name='lead_logs', null=True)
    remarks = models.TextField(null=True)
    followup = models.ForeignKey(Followup, on_delete=models.CASCADE, related_name='lead_logs', null=True)
    entry_date = models.DateTimeField(auto_now_add=True, null=True)
