from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import check_password
from .essentials import createToken


class AdminSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = Users
        exclude = ["user_id"]

    @staticmethod
    def login(data):
        try:
            user = Users.objects.get(email=data["email"])
            if check_password(data["password"], user.password):
                token = createToken(user)
                role_name = user.role.role_name
                user_details = {
                    "user_id":user.user_id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "contact": user.contact,
                    "role": role_name,
                    "image": user.image.url if user.image else None,
                    "gender": user.gender,
                    "country": user.country,
                    "status": user.status,
                    "date_joined": user.date_joined,
                    "dealer": user.dealer.name if user.dealer else None,
                    "dealer_id": user.dealer.dealer_id if user.dealer else None,
                    
                }
                return True, token, user_details
            return False, None, None
        except Users.DoesNotExist:
            return False, None, None
        except Exception as e:
            print(f"Error during login: {e}")
            return False, None, None
