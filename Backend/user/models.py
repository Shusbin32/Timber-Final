from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


#Dealer 
class Dealer(models.Model):
    dealer_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField(null=True, blank=True)
    contact = models.BigIntegerField()
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    landmark = models.CharField(max_length=50, null=True, blank=True)
    state = models.CharField(max_length=50, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[("active", "Active"), ("inactive", "Inactive")]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Role(models.Model):
    role_id = models.AutoField(primary_key=True, editable=False)
    role_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.role_name


# >>>>>> For User
class Users(models.Model):
    user_id = models.AutoField(primary_key=True, editable=False)
    full_name = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    contact = models.BigIntegerField()
    password = models.CharField(max_length=128)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to="userprofile/", null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[("male", "Male"), ("female", "Female")])
    country = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[("active", "Active"), ("inactive", "Inactive")]
    )
    date_joined = models.DateField(null=True, auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.password = make_password(self.password)
            return super(Users, self).save(*args, **kwargs)
        return super(Users, self).save(*args, **kwargs)

    def __str__(self):
        return self.full_name




