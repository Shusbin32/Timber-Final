import datetime
import jwt
from django.conf import settings
from django.http import JsonResponse
from rest_framework.status import *
from django.conf import settings


def sendSuccess(data=None, message=None):
    return JsonResponse(
        {"success": True, "data": data, "message": message}, status=HTTP_200_OK
    )


def sendError(message=None):
    return JsonResponse(
        {"success": False, "message": message}, status=HTTP_400_BAD_REQUEST
    )


def createToken(user):
    payload = {
        "user_id": str(user.user_id),
        "role": user.role.role_id,
        "role_name":user.role.role_name,
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(minutes=60*8),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decodeToken(request):
    try:
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return {"error": True, "message": "Authorization header missing"}

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return {"error": True, "message": "Invalid authorization header format"}

        token = parts[1]
        decoded = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = decoded.get("user_id")
        role = decoded.get("role")
        exp = decoded.get("exp")

        return {
            "user_id": user_id,
            "role": role,
            "exp": exp,
        }

    except jwt.ExpiredSignatureError:
        return {"error": True, "message": "Token has expired. Please relogin"}
    except jwt.InvalidTokenError:
        return {"error": True, "message": "Invalid Token.Please Relogin"}
    except Exception as e:
        return {"error": True, "message": "Token Error.Please Relogin"}


