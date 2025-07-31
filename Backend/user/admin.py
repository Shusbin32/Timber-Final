from django.contrib import admin
from django import forms
from user.models import *


class RoleForm(forms.ModelForm):
    class Meta:
        model = Role
        fields = [ "role_name"]


class RoleAdmin(admin.ModelAdmin):
    form = RoleForm
    list_display = ("role_name", "role_id")
    search_fields = ("role_name",)  


class CustomUserAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        if not change:  # If the user is being created
            obj.new_user()
        else:  # If the user is being updated
            super().save_model(request, obj, form, change)

    list_display = (
        "user_id",
        "username",
        "name",
        "email",
        "contact_no",
        "is_active",
        "created_at",
        "updated_at",
    )
    search_fields = ("username", "email", "name")
    # list_filter = ("is_active", "role")
    ordering = ("-created_at",)

admin.site.register(Users)
admin.site.register(Role)
admin.site.register(Dealer)
