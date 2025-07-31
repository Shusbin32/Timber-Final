import os
from django.http import JsonResponse
from rest_framework.decorators import api_view
from user.serializers import AdminSerializer
from .essentials import *
from .models import Users
from .serializers import *
from django.contrib.auth.hashers import make_password
from rest_framework import status


@api_view(["POST"])
def createDealer(request):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        data = request.data
        print(data)
        if Dealer.objects.filter(name__iexact=data["name"]).exists():
            return sendError("Dealer already exists.")
        dealer = Dealer.objects.create(
            name=data["name"],
            email=data["email"],
            contact=data["contact"],
            address=data["address"],
            city=data["city"],
            landmark=data["landmark"],
            state=data["state"],
            pincode=data["pincode"],
            country=data["country"],
            status=data["status"],
        )
        dealer.save()
        return sendSuccess(None, "Dealer created successfully.")
    except Exception as e:
        return sendError(str(e))

@api_view(["GET"])
def getDealers(request):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        dealers = Dealer.objects.all()
        dealer_list = []
        for dealer in dealers:
            dealer_list.append(
                {
                    "dealer_id": dealer.dealer_id,
                    "name": dealer.name,
                    "email": dealer.email,
                    "contact": dealer.contact,
                    "address": dealer.address,
                    "city": dealer.city,
                    "landmark": dealer.landmark,
                    "state": dealer.state,
                    "pincode": dealer.pincode,
                    "country": dealer.country,
                    "status": dealer.status,
                }
            )
        return sendSuccess(dealer_list, None)
    except Exception as e:
        return sendError(str(e))

@api_view(["GET"])
def getDealer(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        dealer = Dealer.objects.get(dealer_id=id)
        dealer_data = {
            "dealer_id": dealer.dealer_id,
            "name": dealer.name,
            "email": dealer.email,
            "contact": dealer.contact,
            "address": dealer.address,
            "city": dealer.city,
            "landmark": dealer.landmark,
            "state": dealer.state,
            "pincode": dealer.pincode,
            "country": dealer.country,
            "status": dealer.status,
        }
        return sendSuccess(dealer_data, None)
    except Exception as e:
        return sendError(str(e))

@api_view(["PUT"])
def updateDealer(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        data = request.data
        dealer = Dealer.objects.get(dealer_id=id)
        if data.get("name"):
            dealer.name = data["name"]
        if data.get("email"):
            dealer.email = data["email"]
        if data.get("contact"):
            dealer.contact = data["contact"]
        if data.get("address"):
            dealer.address = data["address"]
        if data.get("city"):
            dealer.city = data["city"]
        if data.get("landmark"):
            dealer.landmark = data["landmark"]
        if data.get("state"):
            dealer.state = data["state"]
        if data.get("pincode"):
            dealer.pincode = data["pincode"]
        if data.get("country"):
            dealer.country = data["country"]
        if data.get("status"):
            dealer.status = data["status"]
        dealer.save()
        return sendSuccess(None, "Successfully Updated.")
    except Exception as e:
        return sendError(str(e))

@api_view(["DELETE"])
def deleteDealer(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        if not Dealer.objects.filter(dealer_id=id).exists():
            return sendError("Dealer not found.")
        if Users.objects.filter(dealer=id).exists():
            return sendError("Dealer has users.")
        dealer = Dealer.objects.get(dealer_id=id)
        dealer.delete()
        return sendSuccess(None, "Successfully Deleted.")
    except Exception as e:
        print(f"{e}")
        return sendError(str(e))


@api_view(["GET"]) 
def checkToken(request):
    token_data = decodeToken(request)
    if token_data.get("error"):
        return JsonResponse({"expired": True, "message": token_data.get("message"),"status": status.HTTP_400_BAD_REQUEST})
    return JsonResponse({"expired": False, "user_id": token_data.get("user_id"), "status": status.HTTP_200_OK})

def decodeToken(request):
    try:
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return {"error": True, "message": "Authorization header missing"}
        
        token_parts = auth_header.split(" ")
        if len(token_parts) != 2 or token_parts[0] != "Bearer":
            return {"error": True, "message": "Invalid authorization format"}
        
        token = token_parts[1]
        
        decoded = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM] 
        )
        
        user_id = decoded.get("user_id")
        if not user_id:
            return {"error": True, "message": "Invalid token: missing user_id"}
        
        user = Users.objects.filter(user_id=user_id)
        if not user.exists():
            return {"error": True, "message": "User not found. Please login again."}
        
        # Extract other token data
        role = decoded.get("role")
        exp = decoded.get("exp")
        
        return {
            "user_id": user_id, 
            "role": role, 
            "exp": exp,
            "user": user.first()  # Include user object if needed
        }
        
    except jwt.ExpiredSignatureError:
        return {"error": True, "message": "Session expired. Please login again"}
    except jwt.InvalidTokenError:
        return {"error": True, "message": "Invalid token. Please login again"}
    except Exception as e:
        # Log the actual error for debugging
        print(f"Token decode error: {str(e)}")
        return {"error": True, "message": "Authentication failed. Please login again"}


# admin login
@api_view(["POST"])
def adminLogin(request):
    try:
        data = request.data
        success, token, user_details = AdminSerializer.login(data)
        if success:
            return JsonResponse(
                {
                    "token": token,
                    "message": "Login Successfully",
                    "success": True,
                    "data": user_details,
                    "status": status.HTTP_200_OK,
                }
            )
        return JsonResponse(
            {"success": False, "message": "Credentials do not match"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except Exception as e:
        print(f"{e}")
        return JsonResponse(
            {"success": False, "message": "An error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

# admin logout
@api_view(["POST"])
def logout(request):
    user_id = request.data.get("user_id")
    print(user_id)
    if not user_id:
        return sendError("User ID is required.")

    try:
        user = Users.objects.get(user_id=user_id)
        user.status = "inactive"
        user.save()
        return sendSuccess(None, "Logout successful.")
    except Users.DoesNotExist:
        return sendError("No User Found with the provided ID.")
    except Exception as e:
        return sendError(f"An error occurred: {str(e)}")

@api_view(["PUT"])
def updateuser(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))

    try:
        data = request.data
        user = Users.objects.filter(user_id=id).first()
        if not user:
            return sendError("User not found.")

        if data.get("full_name"):
            user.full_name = data["full_name"]
        if data.get("email"):
            user.email = data["email"]
        if data.get("password"):
            user.password = make_password(data["password"])
        if data.get("contact"):
            user.contact = data["contact"]
        if data.get("gender"):
            user.gender = data["gender"]
        if data.get("country"):
            user.country = data["country"]
        if data.get("status"):
            user.status = data["status"]
        if request.FILES.get("image"):
            user.image = request.FILES["image"]
        if data.get("dealer_id"):
            try:
                user.dealer = Dealer.objects.get(dealer_id=data["dealer_id"])
            except Dealer.DoesNotExist:
                return sendError("Dealer does not exist.")
        if data.get("role_id"):
            try:
                user.role = Role.objects.get(role_id=data["role_id"])
            except Role.DoesNotExist:
                return sendError("Role does not exist.")

        user.save()
        print("Updated and saved successfully.")
        return sendSuccess(None, "User Updated Successfully.")
    except Exception as e:
        print(f"Update error: {e}")
        return sendError(str(e))

@api_view(["GET"])
def get_users(request):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        users = Users.objects.all()
        user_list = []
        for user in users:
            user_list.append(
                     {
                      "user_id": user.user_id,
                     "full_name": user.full_name,
                     "email": user.email,
                     "contact": user.contact,
                     "is_active": user.status,
                     "date_joined": user.date_joined,
                     "image": user.image.url if user.image else None,
                     "gender": user.gender,
                     "country": user.country,
                     "status": user.status,
                     "role_id": user.role.role_id,
                     "role_name": user.role.role_name,
                     "dealer_id": user.dealer.dealer_id if user.dealer else None,
                     "dealer_name": user.dealer.name if user.dealer else None,
                                 }
            )
        return sendSuccess(user_list, None)
    except Exception as e:
        return sendError(str(e))

@api_view(["GET"])
def getoneuser(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        user = Users.objects.filter(user_id=id).first()
        if user:
            user_data ={
                "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "contact": user.contact,
            "role_id": user.role.role_id,
            "role_name": user.role.role_name,
                "dealer_id": user.dealer.dealer_id if user.dealer else None,
            "dealer_name": user.dealer.name if user.dealer else None,
            "gender": user.gender,
            "country": user.country,
            "status": user.status,
            "image": user.image.url if user.image else None,
            }
            return sendSuccess(user_data)
        else:
            return sendError("User Doesnt Exists.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def allusers(request):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        users = Users.objects.all()
        getuser = Users.objects.get(user_id=token["user_id"])
        user_list = []
        for user in users:
            if user.role.role_id != 1:
                if token["user_id"] != user.user_id:
                    if user.role.role_id > getuser.role.role_id:
                        if user.role.role_id < 1000:
                            user_list.append(
                                {
                                    "user_id": user.user_id,
                                    "full_name": user.full_name,
                                    "email": user.email,
                                    "contact_no": user.contact,
                                    "is_active": user.status,
                                    "date_joined": user.date_joined,
                                    "dealer_id": user.dealer.dealer_id if user.dealer else None,
                                    "dealer_name": user.dealer.name if user.dealer else None,
                                    "role": {
                                        "role_id": user.role.role_id,
                                        "role_name": user.role.role_name,
                                    },
                                }
                            )
        return sendSuccess(user_list, None)

    except Exception as e:
        return sendError(f"{e}")


# for all roles
@api_view(["GET"])
def allroles(request):
    try:
        role = request.data.get("role_id")
        if role:
            roles = Role.objects.filter(role=role.role_id)
        else:
            roles = Role.objects.all()
        getRoleList = []
        for role in roles:
            role_list = {"role_id": role.role_id, "role_name": role.role_name,
            "created_at": role.created_at, "updated_at": role.updated_at}
            getRoleList.append(role_list)
        return sendSuccess(getRoleList, None)

    except Exception as e:
        return sendError(f"{e}")
    

@api_view(["POST"])
def createuser(request):
    print("------ Create User API Called ------")

    token = decodeToken(request)
    print(f"Decoded Token: {token}")

    if token.get('error'):
        print("Token Error:", token.get("message"))
        return sendError(token.get("message"))

    try:
        data = request.data
        print("Received Request Data:", dict(data))
        print("Dealer ID in Data:", data.get("dealer_id"))

        required_field = ['full_name', 'contact', 'password', 'role_id', 'email', 'dealer_id']
        missing = [field for field in required_field if not data.get(field)]
        if missing:
            print("Missing Required Fields:", missing)
            return sendError(f"Missing field(s): {', '.join(missing)}")

        try:
            role = Role.objects.get(role_id=data.get('role_id'))
            print(f"Role Found: {role}")
        except Role.DoesNotExist:
            print("Role Not Found:", data.get('role_id'))
            return sendError("Role Doesn't Exist.")

        if Users.objects.filter(email=data.get("email")).exists():
            print("Duplicate Email Found:", data.get("email"))
            return sendError("Email Already Exists.")

        if Users.objects.filter(contact=data.get("contact")).exists():
            print("Duplicate Contact Found:", data.get("contact"))
            return sendError("Contact Already Exists.")

        if not Dealer.objects.filter(dealer_id=data.get("dealer_id")).exists():
            print("Dealer Not Found:", data.get("dealer_id"))
            return sendError("Dealer Doesn't Exist.")

        dealer_instance = Dealer.objects.get(dealer_id=data.get("dealer_id"))

        user = Users.objects.create(
            full_name=data.get('full_name'),
            contact=data.get('contact'),
            dealer=dealer_instance,
            password=data.get('password'),
            role=role,
            email=data.get('email'),
            image=request.FILES.get('image'),
            gender=data.get('gender'),
            country=data.get('country'),
            status=data.get('status'),
        )
        user.save()
        print("User Created Successfully:", user)

        return sendSuccess(None, "Created User Successfully")
    
    except Exception as e:
        print("Exception Occurred:", str(e))
        return sendError(str(e))




@api_view(["POST"])
def createroles(request):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        data = request.data
        roles = Role.objects.create(
            role_name = data.get("role_name")
        )
        roles.save()
        return sendSuccess(None, "Roles Created Successfully.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["PUT"])
def updateroles(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        data = request.data
        role = Role.objects.get(role_id=id)
        if data.get("role_name"):
            role.role_name = data["role_name"]
        role.save()
        return sendSuccess(None, "Successfully Updated.")
    except Exception as e:
        return sendError(f"{e}")


@api_view(['DELETE'])
def deleteroles(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))
    try:
        role = Role.objects.get(role_id=id)
        role.delete()
        return sendSuccess("Deleted Successfully.")
    except Exception as e:
        return sendError(f"{e}")
    