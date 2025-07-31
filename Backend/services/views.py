import re
from django.http import JsonResponse
from numpy.random import f
from rest_framework.decorators import api_view
from .imports_helper.helper import *
from services.models import *
from user.essentials import *
from user.views import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from datetime import datetime
from .models import Lead
from django.db.models import Q
from django.db.models.functions import Lower
from collections import defaultdict
from datetime import datetime
from django.utils.timezone import now
from django.db.models import Prefetch
import pandas as pd
from django.db import transaction
from django.http import HttpResponse

today = now().date()


@api_view(["Post"])
def createdivision(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data

        division = Division.objects.create(
            name = data.get("name")
        )
        division.save()
        return sendSuccess(None, "Division Created Successfully.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["Get"])
def getalldivisions(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        divisions = Division.objects.all().values(
            'division_id', 'name', 'created_at', 'updated_at'
        )
        divisions_list = list(divisions)
        return sendSuccess(divisions_list, "All Divisions")
    except Exception as e:
        print(e)
        return sendError(f"{e}")

@api_view(["Post"])
def updatedivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data
        division = Division.objects.get(division_id=id)
        if data.get("name"):
            division.name = data["name"]
        division.save()
        # Return updated division data
        updated_data = {
            'division_id': division.division_id,
            'name': division.name,
            'created_at': division.created_at,
            'updated_at': division.updated_at
        }
        return sendSuccess(updated_data, "Successfully Updated.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def getdivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        division = Division.objects.get(division_id=id)
        data = {
            'division_id': division.division_id,
            'division_name': division.name,
            'created_at': division.created_at,
            'updated_at': division.updated_at
        }
        return sendSuccess(data, None)
    except Exception as e:
        return sendError(f"{e}")


@api_view(["Delete"])
def deletedivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        division = Division.objects.get(division_id=id)
        division.delete()
        return sendSuccess(None, "Successfully Deleted.")
    except Exception as e:
        print(e)
        return sendError(f"{e}")


@api_view(["Post"])
def createsubdivision(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data
        print(data)
        division = Division.objects.get(division_id=data.get("division"))
        subdivision = SubDivision.objects.create(
            name = data.get("name"),
            division = division
        )
        subdivision.save()
        return sendSuccess(None, "SubDivision Created Successfully.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["Get"])
def getallsubdivisions(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        subdivisions = SubDivision.objects.all()
        data = []
        for subdivision in subdivisions:
            data.append({
                'subdivision_id': subdivision.subdivision_id,
                'subdivision_name': subdivision.name,
                'division_id': subdivision.division_id,
                'division_name': subdivision.division.name,
                'created_at': subdivision.created_at,
                'updated_at': subdivision.updated_at
            })
        return sendSuccess(data, "All SubDivisions")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["Get"])
def getsubdivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        subdivision = SubDivision.objects.get(subdivision_id=id)
        data = {
            'subdivision_id': subdivision.subdivision_id,
            'subdivision_name': subdivision.name,
            'division_id': subdivision.division_id,
            'division_name': subdivision.division.name,
            'created_at': subdivision.created_at,
            'updated_at': subdivision.updated_at
        }
        return sendSuccess(data, "SubDivision")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["PUT"])
def updatesubdivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data
        subdivision = SubDivision.objects.get(subdivision_id=id)
        if data.get("name"):
            subdivision.name = data["name"]
        if data.get("division_id"):
            subdivision.division = Division.objects.get(division_id=data["division_id"])
        subdivision.save()
        # Return updated subdivision data
        updated_data = {
            'subdivision_id': subdivision.subdivision_id,
            'subdivision_name': subdivision.name,
            'division_id': subdivision.division.division_id if subdivision.division else None,
            'division_name': subdivision.division.name if subdivision.division else None,
            'created_at': subdivision.created_at,
            'updated_at': subdivision.updated_at
        }
        return sendSuccess(updated_data, "Successfully Updated.")
    except Exception as e:
        print(f"{e}")
        return sendError(f"{e}")


@api_view(["Delete"])
def deletesubdivision(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        subdivision = SubDivision.objects.get(subdivision_id=id)
        subdivision.delete()
        return sendSuccess(None, "Successfully Deleted.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["POST"])
def createBranch(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data
        branch = Branch.objects.create(
            name = data.get("name")
        )
        branch.save()
        return sendSuccess(None, "Branch Created Successfully.")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["Get"])
def getallbranches(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        branches = Branch.objects.all().values(
            'branch_id', 'name', 'created_at', 'updated_at'
        )
        branches_list = list(branches)
        return sendSuccess(branches_list, "All Branches")
    except Exception as e:
        print(e)
        return sendError(f"{e}")

@api_view(["Get"])
def getbranch(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        branch = Branch.objects.get(branch_id=id)
        data = {
            'branch_id': branch.branch_id,
            'branch_name': branch.name,
            'created_at': branch.created_at,
            'updated_at': branch.updated_at
        }
        return sendSuccess(data, "Branch")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["PUT"])
def updatebranch(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        data = request.data
        branch = Branch.objects.get(branch_id=id)
        if data.get("name"):
            branch.name = data["name"]
        branch.save()
        return sendSuccess(None, "Successfully Updated.")
    except Exception as e:
        print(f"{e}")
        return sendError(f"{e}")

@api_view(["DELETE"])
def deletebranch(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("messsage"))
    try:
        branch = Branch.objects.get(branch_id=id)
        if branch.leads.exists():
            return sendError("Branch has leads associated with it.")
        branch.delete()
        return sendSuccess(None, "Successfully Deleted.")
    except Exception as e:
        return sendError(f"{e}")


@api_view(["POST"])
def createlead(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        data = request.data
        print(data)
        token_user_id = token.get("user_id")

        try:
            created_by_user = Users.objects.get(user_id=token_user_id)
        except Users.DoesNotExist:
            return sendError("User not found.")

        name = data.get("name")
        contact = data.get("contact")

        if not name:
            return sendError("Name is required.")
        if not contact or not str(contact).isdigit() or len(str(contact)) != 10:
            return sendError("Contact must be a 10-digit number.")
        if Lead.objects.filter(contact=contact).exists():
            return sendError("Contact already exists.")

        division = None
        division_id = data.get("division_id")
        if division_id not in [None, "", "null"]:
            try:
                division = Division.objects.get(division_id=division_id)
            except Division.DoesNotExist:
                return sendError("Invalid Division ID.")

        subdivision = None
        subdivision_id = data.get("subdivision_id")
        if subdivision_id not in [None, "", "null"]:
            try:
                subdivision = SubDivision.objects.get(subdivision_id=subdivision_id)
            except SubDivision.DoesNotExist:
                return sendError("Invalid Subdivision ID.")

        branch = None
        branch_id = data.get("branch_id")
        if branch_id not in [None, "", "null"]:
            try:
                branch = Branch.objects.get(branch_id=branch_id)
            except Branch.DoesNotExist:
                return sendError("Invalid Branch ID.")

        assign_to = None
        assign_to_id = data.get("assign_to")
        if assign_to_id not in [None, "", "null"]:
            try:
                assign_to = Users.objects.get(user_id=assign_to_id)
            except Users.DoesNotExist:
                return sendError("Invalid Assign To ID.")

        lead = Lead.objects.create(
            name=name,
            contact=contact,
            address=data.get("address"),
            email=data.get("email"),
            gender=data.get("gender"),
            city=data.get("city"),
            landmark=data.get("landmark"),
            lead_type=data.get("lead_type"),
            source=data.get("source"),
            category=data.get("category"),
            pan_vat=data.get("pan_vat"),
            company_name=data.get("company_name"),
            branch=branch,
            subbranch=data.get("subbranch"),
            tentetive_visit_date=data.get("tentetive_visit_date"),
            tentetive_purchase_date=data.get("tentetive_purchase_date"),
            division=division,
            subdivision=subdivision,
            assign_to=assign_to,
            created_by=created_by_user,
            is_customer=data.get("is_customer", False)
        )
        followup = Followup.objects.create(
            lead=lead,
            user=created_by_user,
            followup_date=data.get("followup_date"),
            followup_type=data.get("followup_type"),
            followup_remarks=data.get("followup_remarks")
        )

        LeadLog.objects.create(
            lead=lead,
            user=created_by_user,
            remarks=data.get("remarks"),
            followup=followup
        )

        if assign_to:
            AssignToUser.objects.create(
                lead=lead,
                user=assign_to
            )

        return sendSuccess(None, "Lead Created Successfully.")

    except Exception as e:
        print(e)
        return sendError("Something went wrong: " + str(e))


@api_view(["PUT"])
def updatelead(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        data = request.data
        print(data)
        user_id = token.get("user_id")

        try:
            user = Users.objects.get(user_id=user_id)
        except Users.DoesNotExist:
            return sendError("User not found.")

        try:
            lead = Lead.objects.get(lead_id=id)
        except Lead.DoesNotExist:
            return sendError("Lead not found.")
        if "contact" in data:
            contact = str(data.get("contact", "")).strip()
            if not contact or not contact.isdigit() or len(contact) != 10:
                return sendError("Contact must be a 10-digit number.")
            if Lead.objects.filter(contact=contact).exclude(lead_id=id).exists():
                return sendError("Contact already exists.")
            lead.contact = contact
        optional_fields = [
            "name", "address", "email", "gender", "city", "landmark",
            "lead_type", "source", "category", "pan_vat", "company_name",
            "tentetive_visit_date", "tentetive_purchase_date", "subbranch"
        ]
        for field in optional_fields:
            if field in data:
                setattr(lead, field, data.get(field, "").strip() if isinstance(data.get(field), str) else data.get(field))

        if "branch_id" in data:
            branch_id = data.get("branch_id")
            if branch_id:
                try:
                    branch = Branch.objects.get(branch_id=branch_id)
                    lead.branch = branch
                except Branch.DoesNotExist:
                    return sendError("Branch not found.")
        if "division_id" in data:
            division_id = data.get("division_id")
            if division_id:
                try:
                    division = Division.objects.get(division_id=division_id)
                    lead.division = division
                except Division.DoesNotExist:
                    return sendError("Division not found.")
            else:
                lead.division = None
        if "subdivision_id" in data:
            subdivision_id = data.get("subdivision_id")
            if subdivision_id:
                try:
                    subdivision = SubDivision.objects.get(subdivision_id=subdivision_id)
                    lead.subdivision = subdivision
                except SubDivision.DoesNotExist:
                    return sendError("Subdivision not found.")
            else:
                lead.subdivision = None
        if "assign_to" in data:
            assign_to_id = data.get("assign_to")
            current_assign_to_id = lead.assign_to.user_id if lead.assign_to else None
            if assign_to_id != current_assign_to_id:
                if assign_to_id:
                    try:
                        new_assign_user = Users.objects.get(user_id=assign_to_id)
                        lead.assign_to = new_assign_user
                        AssignToUser.objects.create(lead=lead, user=new_assign_user)
                    except Users.DoesNotExist:
                        return sendError("Assigned user not found.")
                else:
                    lead.assign_to = None
        if "is_customer" in data:
            is_customer_raw = data.get("is_customer")
            lead.is_customer = str(is_customer_raw).lower() in ["true", "1"]
        lead.save()
        followup = None
        if data.get("followup_date"):
            followup = Followup.objects.create(
                lead=lead,
                user=user,
                followup_date=data.get("followup_date"),
                followup_type=data.get("followup_type"),
                followup_remarks=data.get("followup_remarks")
            )
        LeadLog.objects.create(
            lead=lead,
            user=user,
            remarks=data.get("remarks"),
            followup=followup
        )

        return sendSuccess(None, "Lead updated successfully.")

    except Exception as e:
        print(e)
        return sendError(f"An error occurred: {str(e)}")


@api_view(["GET"])
def getallleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        leads = Lead.objects.all()
        filters = {
            "name__icontains": request.GET.get("name"),
            "contact__icontains": request.GET.get("contact"),
            "city__icontains": request.GET.get("city"),
            "lead_type__icontains": request.GET.get("lead_type"),
            "branch__icontains": request.GET.get("branch"),
            "gender__iexact": request.GET.get("gender")
        }

        for field, value in filters.items():
            if value:
                leads = leads.filter(**{field: value})

        division_id = request.GET.get("division_id")
        if division_id:
            leads = leads.filter(division__division_id=division_id)

        subdivision_id = request.GET.get("subdivision_id")
        if subdivision_id:
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)

        assign_to_id = request.GET.get("assign_to")
        if assign_to_id:
            leads = leads.filter(assign_to__user_id=assign_to_id)

        branch_id = request.GET.get("branch_id")
        if branch_id:
            leads = leads.filter(branch__branch_id=branch_id)

        date_fields = {
            "tentetive_visit_date": request.GET.get("tentetive_visit_date"),
            "tentetive_purchase_date": request.GET.get("tentetive_purchase_date"),
            "created_at": request.GET.get("created_at")
        }

        for field, value in date_fields.items():
            if value:
                try:
                    parsed_date = datetime.strptime(value, "%Y-%m-%d").date()
                    if field == "created_at":
                        leads = leads.filter(created_at__date=parsed_date)
                    else:
                        leads = leads.filter(**{field: parsed_date})
                except ValueError:
                    return sendError(f"Invalid format for {field}. Use YYYY-MM-DD.")

        page = request.GET.get('page', 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()
            assigned_user = lead.assign_to.full_name if lead.assign_to else None
            followup = lead.followups.order_by('-followup_date').first() if lead.followups.exists() else None

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'subbranch': lead.subbranch,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': assigned_user,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'followup': {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } if followup else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'remarks': latest_log.remarks if latest_log else None,
                "is_customer": lead.is_customer
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Leads fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")


@api_view(["GET"])
def getlead(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        lead = Lead.objects.get(lead_id=id)
        leadlog = LeadLog.objects.filter(lead=lead).first()
        assigned_user = lead.assign_to.full_name if lead.assign_to else None
        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'subbranch': lead.subbranch,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name,
                'division_name': lead.subdivision.division.name
            } if lead.subdivision else None,
            'assign_to': assigned_user,
            'created_by': lead.created_by.full_name if lead.created_by else None,
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ],
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            "is_customer":lead.is_customer,
            'remarks_details' :{
                "user":leadlog.user.full_name if leadlog and leadlog.user else None,
                "lead_created_date":leadlog.entry_date if leadlog else None,
                "remarks":leadlog.remarks if leadlog else None

            }
        }
        return sendSuccess(data, "Lead")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def getaftervisitleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        # Show leads that are not raw, completed, or overdue
        leads = Lead.objects.annotate(
            lead_type_lower=Lower('lead_type')
        ).exclude(
            Q(lead_type_lower__icontains='raw') |
            Q(lead_type_lower__icontains='completed') |
            Q(lead_type_lower__icontains='complete') |
            Q(lead_type_lower__icontains='overdue')
        )
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)

        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)

        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)

        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)

        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)

        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)

        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()
            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                "is_customer": lead.is_customer
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "After Visit Leads fetched successfully"
        },safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getaftervisitleadbyid(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.get(lead_id=id)
        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'address': lead.address,
            'email': lead.email,
            'subbranch': lead.subbranch,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            },
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ]
        }

        return sendSuccess(data, "After Visit lead fetched successfully")

    except Lead.DoesNotExist:
        return sendError("After Visit lead not found.")
    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getrawleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        # Filter for raw leads and leads without specific type
        leads = Lead.objects.annotate(
            lead_type_lower=Lower('lead_type')
        ).filter(
            Q(lead_type_lower__icontains='raw') | 
            Q(lead_type_lower__icontains='pending') |
            Q(lead_type__isnull=True) |
            Q(lead_type='')
        )

        # Apply optional filters
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)

        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)

        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)

        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)

        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)

        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()
            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                },
                'followup': [
                    {
                        'followup_date': followup.followup_date,
                        'followup_type': followup.followup_type,
                        'followup_remarks': followup.followup_remarks,
                        'entry_date': followup.entry_date
                    } for followup in lead.followups.all()
                ]
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Raw Leads fetched successfully"
        },safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getrawleadbyid(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.get(lead_id=id)

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            },
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ]
        }

        return sendSuccess(data, "Raw lead fetched successfully")

    except Lead.DoesNotExist:
        return sendError("Raw lead not found.")
    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")



@api_view(["GET"])
def getcompletedleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        leads = Lead.objects.annotate(
            lead_type_lower=Lower('lead_type')
        ).filter(
            Q(lead_type_lower__icontains="completed") |
            Q(lead_type_lower__icontains="complete")
        )
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)

        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)

        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)

        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)

        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)

        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)

        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()
            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                },
                'followup': [
                    {
                        'followup_date': followup.followup_date,
                        'followup_type': followup.followup_type,
                        'followup_remarks': followup.followup_remarks,
                        'entry_date': followup.entry_date
                    } for followup in lead.followups.all()
                ]
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Completed Leads fetched successfully"
        },safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getcompletedleadbyid(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.get(lead_id=id)

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            },
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ]
        }

        return sendSuccess(data, "Completed lead fetched successfully")

    except Lead.DoesNotExist:
        return sendError("Completed lead not found.")
    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")


@api_view(["GET"])
def getbeforevisitleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        # Show leads that are not raw, completed, or overdue
        leads = Lead.objects.annotate(
            lead_type_lower=Lower('lead_type')
        ).exclude(
            Q(lead_type_lower__icontains='raw') |
            Q(lead_type_lower__icontains='completed') |
            Q(lead_type_lower__icontains='complete') |
            Q(lead_type_lower__icontains='overdue')
        )
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)

        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)

        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)

        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)

        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)

        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)

        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()
            data.append({
                'lead_id': lead.lead_id,
                'subbranch': lead.subbranch,
                'name': lead.name,
                'contact': lead.contact,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                },
                'followup': [
                    {
                        'followup_date': followup.followup_date,
                        'followup_type': followup.followup_type,
                        'followup_remarks': followup.followup_remarks,
                        'entry_date': followup.entry_date
                    } for followup in lead.followups.all()
                ]
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Before Visit Leads fetched successfully"
        },safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getbeforevisitleadbyid(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.get(lead_id=id)
        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'subbranch': lead.subbranch,
            'name': lead.name,
            'contact': lead.contact,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            },
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ]
        }

        return sendSuccess(data, "Before Visit lead fetched successfully")

    except Lead.DoesNotExist:
        return sendError("Before Visit lead not found.")
    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")


@api_view(["POST"])
def assignleadtouser(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        data = request.data
        users = token.get("user_id")
        lead = Lead.objects.get(lead_id=data.get("lead_id"))
        user = Users.objects.get(user_id=data.get("user_id"))
        lead.assign_to = user
        lead.save()
        log = LeadLog.objects.create(
            lead = lead,
            user = users,
        )
        log.save()
        return sendSuccess(None, "Successfully Assigned.")
    except Exception as e:
        return sendError(f"{e}") 

#for that user assign leads 
@api_view(["GET"])
def getallassignleads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        user_id = token.get("user_id")
        assigned_entries = AssignToUser.objects.filter(user_id=user_id).select_related('lead')  
        if not assigned_entries.exists():
            return sendSuccess([], "No leads assigned to this user.")
        data = []
        for assignment in assigned_entries:
            lead = assignment.lead
            if lead:
                data.append({
                'lead_id': lead.lead_id,
                'subbranch': lead.subbranch,
                'name': lead.name,
                'contact': lead.contact,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch':{
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                "is_customer":lead.is_customer,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'followup': [{
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()],
            })
        return sendSuccess(data, "Assigned Leads")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def getassignlead(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        user_id = token.get("user_id")
        assign = AssignToUser.objects.select_related('lead').filter(
            lead__lead_id=id,
            user_id=user_id
        ).first()
        if not assign or not assign.lead:
            return sendError("This lead is not assigned to you or does not exist.")
        lead = assign.lead
        data = {
            'lead_id': lead.lead_id,
            'subbranch': lead.subbranch,
            'name': lead.name,
            'contact': lead.contact,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch':{
                'branch_id': lead.branch.branch_id,
                'branch_name': lead.branch.name
            } if lead.branch else None,
            "is_customer":lead.is_customer,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'followup': [{
                'followup_date': followup.followup_date,
                'followup_type': followup.followup_type,
                'followup_remarks': followup.followup_remarks,
                'entry_date': followup.entry_date
            } for followup in lead.followups.all()],
        }
        return sendSuccess(data, "Assigned Lead")
    except Exception as e:
        return sendError(f"{e}")




@api_view(["GET"])
def allleadlogdetails(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    params = request.GET
    filters = Q()
    lead_filters = Q()

    def safe_date(param):
        try:
            return datetime.strptime(param, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None

    lead_id = params.get('lead_id')
    user_id = params.get('user_id')
    name = params.get('name')
    contact = params.get('contact')
    city = params.get('city')
    source = params.get('source')
    category = params.get('category')
    from_date = safe_date(params.get('from_date'))
    to_date = safe_date(params.get('to_date'))
    branch_id = params.get('branch_id')

    # Build lead filters (optional)
    if lead_id:
        lead_filters &= Q(id=lead_id)
    if name:
        lead_filters &= Q(name__icontains=name)
    if contact:
        lead_filters &= Q(contact__icontains=contact)
    if city:
        lead_filters &= Q(city__icontains=city)
    if source:
        lead_filters &= Q(source__icontains=source)
    if category:
        lead_filters &= Q(category__icontains=category)

    try:
        limit = int(params.get('limit', 20))
        page = int(params.get('page', 1))
    except ValueError:
        return sendError("Invalid pagination parameters")

    # Get filtered leads
    leads_queryset = Lead.objects.filter(lead_filters).order_by('-created_at')
    paginator = Paginator(leads_queryset, limit)

    try:
        leads_page = paginator.page(page)
    except EmptyPage:
        return sendError("Page number out of range")

    # Collect lead IDs from paginated page
    lead_ids = [lead.lead_id for lead in leads_page]

    # Fetch all logs for leads in current page
    log_filters = Q(lead_id__in=lead_ids)
    if user_id:
        log_filters &= Q(user__id=user_id)
    if from_date:
        log_filters &= Q(entry_date__date__gte=from_date)
    if to_date:
        log_filters &= Q(entry_date__date__lte=to_date)
    if branch_id:
        log_filters &= Q(lead__branch_id=branch_id)

    logs = LeadLog.objects.select_related('user', 'lead').filter(log_filters).order_by('-entry_date')

    # Group logs by lead ID
    lead_logs = defaultdict(list)
    for log in logs:
        lead_logs[log.lead.lead_id].append({
            'entry_date': log.entry_date,
            'remarks': log.remarks,
            'user_id': log.user.user_id,
            'user_full_name': log.user.full_name,
        })

    # Build response data per lead
    results = []
    for lead in leads_page:
        results.append({
            "lead_id": lead.lead_id,
            "subbranch": lead.subbranch,
            "name": lead.name,
            "contact": lead.contact,
            "address": lead.address,
            "email": lead.email,
            "gender": lead.gender,
            "city": lead.city,
            "landmark": lead.landmark,
            "lead_type": lead.lead_type,
            "source": lead.source,
            "category": lead.category,
            "pan_vat": lead.pan_vat,
            "company_name": lead.company_name,
            "branch": {
                "branch_id": lead.branch.branch_id,
                "branch_name": lead.branch.name
            } if lead.branch else None,
            "tentetive_visit_date": lead.tentetive_visit_date,
            "tentetive_purchase_date": lead.tentetive_purchase_date,
            "assign_to": lead.assign_to.full_name if lead.assign_to else None,
            "is_customer": lead.is_customer,
            "division_id": lead.division.division_id if lead.division else None,
            "division_name": lead.division.name if lead.division else None,
            "subdivision_id": lead.subdivision.subdivision_id if lead.subdivision else None,
            "subdivision_name": lead.subdivision.name if lead.subdivision else None,
            "created_at": lead.created_at,
            "updated_at": lead.updated_at,
            "assigntouser": [
                {
                    "user_id": assign_to_user.user.user_id,
                    "user_full_name": assign_to_user.user.full_name,
                    "created_at": assign_to_user.created_at,
                    "updated_at": assign_to_user.updated_at,
                    "assigntouser_id": assign_to_user.assigntouser,
                }
                for assign_to_user in AssignToUser.objects.filter(lead=lead)
            ],
            "followup": [{
                'followup_date': followup.followup_date,
                'followup_type': followup.followup_type,
                'followup_remarks': followup.followup_remarks,
                'entry_date': followup.entry_date
            } for followup in lead.followups.all()],
            "logs": lead_logs.get(lead.lead_id, []),
        })

    return sendSuccess({
        'total_leads': paginator.count,
        'total_pages': paginator.num_pages,
        'current_page': page,
        'results': results
    }, "All Lead Logs")



@api_view(["GET"])
def leadlogdetails(request,id):
    token= decodeToken(request)
    if token.get('error'): 
        return sendError(token.get("message"))
    try:
        log = Lead.objects.get(lead_id=id)
        data = {
            'lead_id': log.lead_id,
            'user_id': log.user.user_id,
            'name': log.name,
            'contact': log.contact,
            'address': log.address,
            'email': log.email,
            'gender': log.gender,
            'city': log.city,
            'landmark': log.landmark,
            'lead_type': log.lead_type,
            'source': log.source,
            'category': log.category,
            'pan_vat': log.pan_vat,
            'company_name': log.company_name,
            "is_customer":log.is_customer,
            'subbranch': log.subbranch,
            'branch_id': log.branch.branch_id if log.branch else None,
            'branch_name': log.branch.name if log.branch else None,
            'tentetive_visit_date': log.tentetive_visit_date,
            'tentetive_purchase_date': log.tentetive_purchase_date,
            'division': {
                "division_id": log.division.division_id,
                "name": log.division.name,
            }, 
            'subdivision': {
                "subdivision_id": log.subdivision.subdivision_id,
                "name": log.subdivision.name,
            },
            'assign_to': log.assign_to.full_name if log.assign_to else None,
            "log_details":
            [
                {
                'lead_created_at': log.created_at,
                'lead_updated_at': log.updated_at,
                'entry_date': log.entry_date,
                'remarks':log.remarks
                } for log in LeadLog.objects.filter(lead=log)
            ],
            "assign_to_user": [
                {
                    "user_id": assign_to_user.user.user_id,
                    "user_full_name": assign_to_user.user.full_name,
                    "created_at": assign_to_user.created_at,
                    "updated_at": assign_to_user.updated_at,
                    "assigntouser_id": assign_to_user.assigntouser,
                }
                for assign_to_user in AssignToUser.objects.filter(lead=log)
            ]
        }
        return sendSuccess(data, "Lead Log Details")
    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def iscustomer(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        leads = Lead.objects.filter(is_customer=True)

        # Optional search filters
        name = request.GET.get("name")
        contact = request.GET.get("contact")
        city = request.GET.get("city")
        division_id = request.GET.get("division_id")
        subdivision_id = request.GET.get("subdivision_id")
        branch = request.GET.get("branch_id")
        gender = request.GET.get("gender")
        assign_to = request.GET.get("assign_to")
        created_at = request.GET.get("created_at")

        if name:
            leads = leads.filter(name__icontains=name)
        if contact:
            leads = leads.filter(contact__icontains=contact)
        if city:
            leads = leads.filter(city__icontains=city)
        if division_id:
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id:
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if branch:
            leads = leads.filter(branch__branch_id=branch)
        if gender:
            leads = leads.filter(gender__iexact=gender)
        if assign_to:
            leads = leads.filter(assign_to__user_id=assign_to)
        if created_at:
            try:
                created_at_obj = datetime.strptime(created_at, "%Y-%m-%d").date()
                leads = leads.filter(created_at__date=created_at_obj)
            except ValueError:
                return sendError("Invalid format for created_at. Use YYYY-MM-DD.")

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by("-entry_date").first()

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch': {
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    "division_id": lead.division.division_id,
                    "name": lead.division.name,
                } if lead.division else None,
                'subdivision': {
                    "subdivision_id": lead.subdivision.subdivision_id,
                    "name": lead.subdivision.name,
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                "is_customer": lead.is_customer,
                'remarks_detail': {
                    "user": latest_log.user.full_name if latest_log and latest_log.user else None,
                    "lead_created_date": latest_log.entry_date if latest_log else None,
                    "remarks": latest_log.remarks if latest_log else None
                },
                'followup': [
                    {
                        'followup_date': followup.followup_date,
                        'followup_type': followup.followup_type,
                        'followup_remarks': followup.followup_remarks,
                        'entry_date': followup.entry_date
                    } for followup in lead.followups.all()
                ]
            })

        return JsonResponse(
            {
            "total_pages": paginator.num_pages,
            "total_leads": paginator.count,
            "current_page": int(page),
            "message": "IS Customer",
            "data": data
            },
            safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")


@api_view(["GET"])
def get_customer_lead_by_id(request, id):
    token = decodeToken(request)
    if token.get("error"):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.get(lead_id=id, is_customer=True)

        latest_log = LeadLog.objects.filter(lead=lead).order_by("-entry_date").first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch_id': lead.branch.branch_id if lead.branch else None,
            'branch_name': lead.branch.name if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                "division_id": lead.division.division_id,
                "name": lead.division.name,
            } if lead.division else None,
            'subdivision': {
                "subdivision_id": lead.subdivision.subdivision_id,
                "name": lead.subdivision.name,
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_by': lead.created_by.full_name if lead.created_by else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            "is_customer": lead.is_customer,
            'remarks_detail': {
                "user": latest_log.user.full_name if latest_log and latest_log.user else None,
                "lead_created_date": latest_log.entry_date if latest_log else None,
                "remarks": latest_log.remarks if latest_log else None
            },
            'followup': [
                {
                    'followup_date': followup.followup_date,
                    'followup_type': followup.followup_type,
                    'followup_remarks': followup.followup_remarks,
                    'entry_date': followup.entry_date
                } for followup in lead.followups.all()
            ]
        }

        return sendSuccess(data, "Customer lead fetched successfully")

    except Lead.DoesNotExist:
        return sendError("Customer lead not found")
    except Exception as e:
        return sendError(f"Error: {str(e)}")


#For assign leads to user , for created by user lead specific user , assign to user that can be changed 
@api_view(["GET"])
def get_leads_according_to_user(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    
    try:
        user_id = token.get("user_id")
        user = Users.objects.get(user_id=user_id)

        # Get all lead ids assigned via AssignToUser table
        assigned_lead_ids = AssignToUser.objects.filter(user=user).values_list('lead_id', flat=True)

        # Base queryset: leads where user is assigned (directly or via AssignToUser) or creator
        leads = Lead.objects.filter(
            Q(assign_to=user) | 
            Q(lead_id__in=assigned_lead_ids) | 
            Q(created_by=user)
        ).distinct()

        # Optional filters from query params
        name = request.GET.get("name")
        contact = request.GET.get("contact")
        city = request.GET.get("city")
        division_id = request.GET.get("division_id")
        subdivision_id = request.GET.get("subdivision_id")
        branch = request.GET.get("branch_id")
        gender = request.GET.get("gender")
        lead_type = request.GET.get("lead_type")
        is_customer = request.GET.get("is_customer")

        if name:
            leads = leads.filter(name__icontains=name)
        if contact:
            leads = leads.filter(contact__icontains=contact)
        if city:
            leads = leads.filter(city__icontains=city)
        if division_id:
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id:
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if branch:
            leads = leads.filter(branch__branch_id=branch)
        if gender:
            leads = leads.filter(gender__iexact=gender)
        if lead_type:
            leads = leads.filter(lead_type__iexact=lead_type)
        if is_customer is not None:
            # handle boolean filter from query params
            if is_customer.lower() in ['true', '1']:
                leads = leads.filter(is_customer=True)
            elif is_customer.lower() in ['false', '0']:
                leads = leads.filter(is_customer=False)

        # Pagination
        page = request.GET.get("page", 1)
        limit = request.GET.get("limit", 20)

        paginator = Paginator(leads.order_by('-created_at'), limit)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            return sendError("Page number out of range")

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by("-entry_date").first()
            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch_id': lead.branch.branch_id if lead.branch else None,
                'branch_name': lead.branch.name if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    "division_id": lead.division.division_id,
                    "name": lead.division.name,
                } if lead.division else None,
                'subdivision': {
                    "subdivision_id": lead.subdivision.subdivision_id,
                    "name": lead.subdivision.name,
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_by': lead.created_by.full_name if lead.created_by else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                "is_customer": lead.is_customer,
                'remarks_detail': {
                    "user": latest_log.user.full_name if latest_log and latest_log.user else None,
                    "lead_created_date": latest_log.entry_date if latest_log else None,
                    "remarks": latest_log.remarks if latest_log else None
                },
                'followup': [
                    {
                        'followup_date': followup.followup_date,
                        'followup_type': followup.followup_type,
                        'followup_remarks': followup.followup_remarks,
                        'entry_date': followup.entry_date
                    } for followup in lead.followups.all()
                ]
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Leads for User"
        }, safe=False, status=200)

    except Users.DoesNotExist:
        return sendError("User not found.")
    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["POST"])
def followup_lead_reschedule(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        followup_date = request.data.get("followup_date")
        followup_type = request.data.get("followup_type")
        followup_remarks = request.data.get("followup_remarks")
        
        lead = Lead.objects.get(lead_id=id)
        followup = Followup.objects.create(
            lead=lead,
            followup_date=followup_date,
            followup_type=followup_type,
            followup_remarks=followup_remarks,
        )
        followup.save()
        return sendSuccess(None, "Followup created successfully")
    except Lead.DoesNotExist:
        return sendError("Lead not found")
    except Exception as e:
        return sendError(f"Error: {str(e)}")


@api_view(["GET"])
def getallfollowup(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        leads = Lead.objects.all().prefetch_related('followups')  # Optimize DB query

        # Optional Filters
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)
        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)
        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)
        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)
        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        data = []
        for lead in leads_page:
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

            followups_all = lead.followups.all()
            followup_data = {
                'all': [],
                'overdue': [],
                'pending': [],
                'completed': [],
            }

            for f in followups_all:
                item = {
                    'followup_date': f.followup_date,
                    'followup_type': f.followup_type,
                    'followup_remarks': f.followup_remarks,
                    'entry_date': f.entry_date
                }
                followup_data['all'].append(item)
                if f.followup_type in followup_data:
                    followup_data[f.followup_type].append(item)

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch': {
                    'branch_id': lead.branch.branch_id,
                    'branch_name': lead.branch.name
                } if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                },
                'followup': followup_data
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Completed Leads fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")

@api_view(["GET"])
def getfollowupbyid(request, id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.prefetch_related('followups').filter(lead_id=id).first()
        if not lead:
            return sendError("Lead not found")

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        followups_all = lead.followups.all()
        followup_data = {
            'all': [],
            'overdue': [],
            'pending': [],
            'completed': [],
        }

        for f in followups_all:
            item = {
                'followup_date': f.followup_date,
                'followup_type': f.followup_type,
                'followup_remarks': f.followup_remarks,
                'entry_date': f.entry_date
            }
            followup_data['all'].append(item)
            if f.followup_type in followup_data:
                followup_data[f.followup_type].append(item)

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch_id': lead.branch.branch_id if lead.branch else None,
            'branch_name': lead.branch.name if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            },
            'followup': followup_data
        }

        return JsonResponse({
            'data': data,
            'message': "Lead and follow-up details fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        print(e)
        return sendError(f"Error: {str(e)}")


@api_view(["GET"])
def getalloverduefollowup(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        # Base queryset for leads with completed followups
        leads = Lead.objects.all()

        # Apply filters (search)
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)
        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)
        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)
        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)
        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        overdue_followups_qs = Followup.objects.filter(followup_type="overdue").select_related('user')
        leads = leads.prefetch_related(Prefetch('followups', queryset=overdue_followups_qs))

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        today = now().date()
        data = []

        
        for lead in leads_page:
            # Get followups for this lead from prefetched data
            followup_list = list(lead.followups.all())

            # Sort followups: today's date first, then by followup_date descending
            followup_list.sort(key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0)))

            # Format followups array
            followup_data = []
            for f in followup_list:
                followup_data.append({
                    'followup_id': f.followup_id,
                    'followup_date': f.followup_date,
                    'followup_type': f.followup_type,
                    'followup_remarks': f.followup_remarks,
                    'entry_date': f.entry_date,
                    'user': {
                        'user_id': f.user.user_id if f.user else None,
                        'full_name': f.user.full_name if f.user else None,
                    }
                })

            # Get latest log for lead
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch_id': lead.branch.branch_id if lead.branch else None,
                'branch_name': lead.branch.name if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                } if latest_log else None,
                'followups': followup_data
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Overdue followups grouped by lead fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        return sendError(f"{e}")

@api_view(["GET"])
def getoverduefollowupbyid(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.filter(lead_id=id).prefetch_related(
            Prefetch(
                'followups',
                queryset=Followup.objects.filter(followup_type="overdue").select_related('user'),
                to_attr='overdue_followups'
            )
        ).first()

        if not lead:
            return sendError(f"Lead with id {id} not found.")

        today = now().date()

        # Sort followups: today first, then descending date
        followup_list = getattr(lead, 'overdue_followups', [])
        followup_list.sort(key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0)))

        followup_data = []
        for f in followup_list:
            followup_data.append({
                'followup_id': f.followup_id,
                'followup_date': f.followup_date,
                'followup_type': f.followup_type,
                'followup_remarks': f.followup_remarks,
                'entry_date': f.entry_date,
                'user': {
                    'user_id': f.user.user_id if f.user else None,
                    'full_name': f.user.full_name if f.user else None,
                }
            })

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch_id': lead.branch.branch_id if lead.branch else None,
            'branch_name': lead.branch.name if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            } if latest_log else None,
            'followups': followup_data,
        }

        return sendSuccess(data, "Overdue followups for lead fetched successfully")

    except Exception as e:
        return sendError(f"{e}")


@api_view(["GET"])
def getallpendingfollowup(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        # Base queryset for leads with completed followups
        leads = Lead.objects.all()

        # Apply filters (search)
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)
        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)
        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)
        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)
        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        pending_followups_qs = Followup.objects.filter(followup_type="pending").select_related('user')
        leads = leads.prefetch_related(Prefetch('followups', queryset=pending_followups_qs))

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        today = now().date()
        data = []

        for lead in leads_page:
            # Get followups for this lead from prefetched data
            followup_list = list(lead.followups.all())

            # Sort followups: today's date first, then by followup_date descending
            followup_list.sort(key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0)))

            # Format followups array
            followup_data = []
            for f in followup_list:
                followup_data.append({
                    'followup_id': f.followup_id,
                    'followup_date': f.followup_date,
                    'followup_type': f.followup_type,
                    'followup_remarks': f.followup_remarks,
                    'entry_date': f.entry_date,
                    'user': {
                        'user_id': f.user.user_id if f.user else None,
                        'full_name': f.user.full_name if f.user else None,
                    }
                })

            # Get latest log for lead
            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch_id': lead.branch.branch_id if lead.branch else None,
                'branch_name': lead.branch.name if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                } if latest_log else None,
                'followups': followup_data
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Pending followups grouped by lead fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        return sendError(f"{e}")


@api_view(["GET"])
def getpendingfollowupbyid(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        lead = Lead.objects.filter(lead_id=id).prefetch_related(
            Prefetch(
                'followups',
                queryset=Followup.objects.filter(followup_type="pending").select_related('user'),
                to_attr='pending_followups'
            )
        ).first()

        if not lead:
            return sendError(f"Lead with id {id} not found.")

        today = now().date()

        # Sort followups: today first, then descending date
        followup_list = getattr(lead, 'pending_followups', [])
        followup_list.sort(key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0)))

        followup_data = []
        for f in followup_list:
            followup_data.append({
                'followup_id': f.followup_id,
                'followup_date': f.followup_date,
                'followup_type': f.followup_type,
                'followup_remarks': f.followup_remarks,
                'entry_date': f.entry_date,
                'user': {
                    'user_id': f.user.user_id if f.user else None,
                    'full_name': f.user.full_name if f.user else None,
                }
            })

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch_id': lead.branch.branch_id if lead.branch else None,
            'branch_name': lead.branch.name if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            } if latest_log else None,
            'followups': followup_data,
        }

        return sendSuccess(data, "Pending followups for lead fetched successfully")

    except Exception as e:
        return sendError(f"{e}")


@api_view(["GET"])
def getallcompletedfollowup(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    
    try:
        leads = Lead.objects.all()

        # Apply filters (search)
        if name := request.GET.get("name"):
            leads = leads.filter(name__icontains=name)
        if contact := request.GET.get("contact"):
            leads = leads.filter(contact__icontains=contact)
        if city := request.GET.get("city"):
            leads = leads.filter(city__icontains=city)
        if division_id := request.GET.get("division_id"):
            leads = leads.filter(division__division_id=division_id)
        if subdivision_id := request.GET.get("subdivision_id"):
            leads = leads.filter(subdivision__subdivision_id=subdivision_id)
        if assign_to := request.GET.get("assign_to"):
            leads = leads.filter(assign_to__user_id=assign_to)
        if branch_id := request.GET.get("branch_id"):
            leads = leads.filter(branch__branch_id=branch_id)

        completed_followups_qs = Followup.objects.filter(followup_type="completed").select_related('user')
        leads = leads.prefetch_related(Prefetch('followups', queryset=completed_followups_qs))

        # Pagination
        page = request.GET.get("page", 1)
        paginator = Paginator(leads, 20)

        try:
            leads_page = paginator.page(page)
        except PageNotAnInteger:
            leads_page = paginator.page(1)
        except EmptyPage:
            leads_page = []

        today = now().date()
        data = []

        for lead in leads_page:
            followup_list = list(lead.followups.all())

            # Sort followups: today's first, then by descending date
            followup_list.sort(
                key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0))
            )

            followup_data = []
            for f in followup_list:
                followup_data.append({
                    'followup_id': f.followup_id,
                    'followup_date': f.followup_date,
                    'followup_type': f.followup_type,
                    'followup_remarks': f.followup_remarks,
                    'entry_date': f.entry_date,
                    'user': {
                        'user_id': f.user.user_id if f.user else None,
                        'full_name': f.user.full_name if f.user else None,
                    }
                })

            latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

            data.append({
                'lead_id': lead.lead_id,
                'name': lead.name,
                'contact': lead.contact,
                'subbranch': lead.subbranch,
                'address': lead.address,
                'email': lead.email,
                'gender': lead.gender,
                'city': lead.city,
                'landmark': lead.landmark,
                'lead_type': lead.lead_type,
                'source': lead.source,
                'category': lead.category,
                'pan_vat': lead.pan_vat,
                'company_name': lead.company_name,
                'branch_id': lead.branch.branch_id if lead.branch else None,
                'branch_name': lead.branch.name if lead.branch else None,
                'tentetive_visit_date': lead.tentetive_visit_date,
                'tentetive_purchase_date': lead.tentetive_purchase_date,
                'division': {
                    'division_id': lead.division.division_id,
                    'name': lead.division.name
                } if lead.division else None,
                'subdivision': {
                    'subdivision_id': lead.subdivision.subdivision_id,
                    'name': lead.subdivision.name
                } if lead.subdivision else None,
                'assign_to': lead.assign_to.full_name if lead.assign_to else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
                'is_customer': lead.is_customer,
                'remarks_details': {
                    'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                    'lead_created_date': latest_log.entry_date if latest_log else None,
                    'remarks': latest_log.remarks if latest_log else None
                } if latest_log else None,
                'followups': followup_data
            })

        return JsonResponse({
            'data': data,
            'total_pages': paginator.num_pages,
            'total_leads': paginator.count,
            'current_page': int(page),
            'message': "Completed Leads fetched successfully"
        }, safe=False, status=200)

    except Exception as e:
        return sendError(f"{e}")


@api_view(["GET"])
def getcompletedfollowupbyid(request,id):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))

    try:
        lead = Lead.objects.filter(lead_id=id).prefetch_related(
            Prefetch(
                'followups',
                queryset=Followup.objects.filter(followup_type="completed").select_related('user'),
                to_attr='completed_followups'
            )
        ).first()

        if not lead:
            return sendError(f"Lead with id {id} not found.")

        today = now().date()

        # Sort followups: today first, then descending date
        followup_list = getattr(lead, 'completed_followups', [])
        followup_list.sort(key=lambda x: (x.followup_date.date() != today, -(x.followup_date.timestamp() if x.followup_date else 0)))

        followup_data = []
        for f in followup_list:
            followup_data.append({
                'followup_id': f.followup_id,
                'followup_date': f.followup_date,
                'followup_type': f.followup_type,
                'followup_remarks': f.followup_remarks,
                'entry_date': f.entry_date,
                'user': {
                    'user_id': f.user.user_id if f.user else None,
                    'full_name': f.user.full_name if f.user else None,
                }
            })

        latest_log = LeadLog.objects.filter(lead=lead).order_by('-entry_date').first()

        data = {
            'lead_id': lead.lead_id,
            'name': lead.name,
            'contact': lead.contact,
            'subbranch': lead.subbranch,
            'address': lead.address,
            'email': lead.email,
            'gender': lead.gender,
            'city': lead.city,
            'landmark': lead.landmark,
            'lead_type': lead.lead_type,
            'source': lead.source,
            'category': lead.category,
            'pan_vat': lead.pan_vat,
            'company_name': lead.company_name,
            'branch_id': lead.branch.branch_id if lead.branch else None,
            'branch_name': lead.branch.name if lead.branch else None,
            'tentetive_visit_date': lead.tentetive_visit_date,
            'tentetive_purchase_date': lead.tentetive_purchase_date,
            'division': {
                'division_id': lead.division.division_id,
                'name': lead.division.name
            } if lead.division else None,
            'subdivision': {
                'subdivision_id': lead.subdivision.subdivision_id,
                'name': lead.subdivision.name
            } if lead.subdivision else None,
            'assign_to': lead.assign_to.full_name if lead.assign_to else None,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'is_customer': lead.is_customer,
            'remarks_details': {
                'user': latest_log.user.full_name if latest_log and latest_log.user else None,
                'lead_created_date': latest_log.entry_date if latest_log else None,
                'remarks': latest_log.remarks if latest_log else None
            } if latest_log else None,
            'followups': followup_data,
        }

        return sendSuccess(data, "Completed followups for lead fetched successfully")

    except Exception as e:
        return sendError(f"{e}")


#import for leads
@api_view(["POST"])
def importleads (request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        user = token.get("user_id")
        file = request.FILES.get("file")
        if not file:
            return sendError("No file uploaded")
        print(pd.read_csv(file))
        df = pd.read_csv(file)
        print(df.head())
        if not df:
            return sendError("No data found in file")
        required_columns = ["name", "contact", "gender", "address", "email"]
        for col in required_columns:
            if col not in df.columns:
                return sendError(f"Column {col} not found in file")
        try:
            created_by_user = Users.objects.get(user_id=user)
        except Users.DoesNotExist:
            return sendError("User not found")
        
        result = []
        for index, row in df.iterrows():
            try:
                with transaction.atomic():
                    name = clean_values(row.get("name"))
                    contact = clean_values(row.get("contact"))
                    if len(str(contact)) != 10:
                        raise ValueError("Contact number must be 10 digits")
                    if Lead.objects.filter(contact=contact).exists():
                        raise ValueError("Contact number already exists")
                    email = clean_values(row.get("email"))
                    if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email):
                        raise ValueError("Invalid email format")
                    gender = clean_values(row.get("gender"))
                    address = clean_values(row.get("address"))
                    
                    #for fk key
                    division = get_fk_instance(Division, "division_id", clean_values(row.get("division")))
                    subdivision = get_fk_instance(SubDivision, "subdivision_id", clean_values(row.get("subdivision")))
                    branch = get_fk_instance(Branch, "branch_id", clean_values(row.get("branch")))
                    assign_to = get_fk_instance(Users, "user_id", clean_values(row.get("assign_to")))

                    is_customer = str(clean_values(row.get("is_customer"))).lower() == "true"

                    lead_type = "completed" if is_customer else clean_values(row.get("lead_type"))
                    source = clean_values(row.get("source"))
                    category = clean_values(row.get("category"))
                    pan_vat = clean_values(row.get("pan_vat"))
                    company_name = clean_values(row.get("company_name"))
                    tentetive_visit_date = clean_values(row.get("tentetive_visit_date"))
                    tentetive_purchase_date = clean_values(row.get("tentetive_purchase_date"))
                    city = clean_values(row.get("city"))
                    landmark = clean_values(row.get("landmark"))
                    subbranch = clean_values(row.get("subbranch"))

                    lead = Lead.objects.create(
                        name = name,
                        contact = contact,
                        email = email,
                        gender = gender,
                        address = address,
                        division = division,
                        subdivision = subdivision,
                        branch = branch,
                        assign_to = assign_to,
                        is_customer = is_customer,
                        lead_type = lead_type,
                        source = source,
                        category = category,
                        pan_vat = pan_vat,
                        company_name = company_name,
                        tentetive_visit_date = tentetive_visit_date,
                        tentetive_purchase_date = tentetive_purchase_date,
                        city = city,
                        landmark = landmark,
                        subbranch = subbranch,
                        created_by = created_by_user,
                        updated_by = created_by_user
                    )
                    
                    followup_date = parsed_date(clean_values(row.get("followup_date")))
                    followup_type = clean_values(row.get("followup_type"))
                    followup_remarks = clean_values(row.get("followup_remarks"))
                    followup = None
                    if followup_date and followup_type and followup_remarks:
                        followup = Followup.objects.create(
                            lead = lead,
                            followup_date = followup_date,
                            followup_type = followup_type,
                            followup_remarks = followup_remarks,
                            entry_date = now(),
                            user = created_by_user
                        )
                    
                    remarks = clean_values(row.get("remarks"))
                    lead_log = None
                    if remarks:
                        lead_log = LeadLog.objects.create(
                            lead = lead,
                            user = created_by_user,
                            remarks = remarks,
                            followup = followup,
                            entry_date = now()
                        )
                    if assign_to:
                        AssignToUser.objects.create(
                            lead = lead,
                            user = assign_to,
                            created_at = now(),
                        )
                    
                    result.append({"row": index, "success": True}, Safe=False, status=200)
                
            except Exception as e:
                result.append({"row": index, "message": str(e)}, Safe=False)
        return JsonResponse({"data":result, "message":"Leads imported successfully"}, safe=False, status=200)
    except Exception as e:
        print(e)
        return sendError(f"{e}")
    

#Apply lead filters while export leads
def apply_lead_filters(queryset, params):
    if name := params.get("name"):
        queryset = queryset.filter(name__icontains=name)
    if contact := params.get("contact"):
        queryset = queryset.filter(contact__icontains=contact)
    if email := params.get("email"):
        queryset = queryset.filter(email__icontains=email)
    if gender := params.get("gender"):
        queryset = queryset.filter(gender=gender)
    if lead_type := params.get("lead_type"):
        queryset = queryset.filter(lead_type=lead_type)
    if source := params.get("source"):
        queryset = queryset.filter(source__icontains=source)
    if category := params.get("category"):
        queryset = queryset.filter(category__icontains=category)
    if pan_vat := params.get("pan_vat"):
        queryset = queryset.filter(pan_vat__icontains=pan_vat)
    if company_name := params.get("company_name"):
        queryset = queryset.filter(company_name__icontains=company_name)
    if tentetive_visit_date := params.get("tentetive_visit_date"):
        queryset = queryset.filter(tentetive_visit_date__icontains=tentetive_visit_date)
    if tentetive_purchase_date := params.get("tentetive_purchase_date"):
        queryset = queryset.filter(tentetive_purchase_date__icontains=tentetive_purchase_date)
    if city := params.get("city"):
        queryset = queryset.filter(city__icontains=city)
    if landmark := params.get("landmark"):
        queryset = queryset.filter(landmark__icontains=landmark)
    if subbranch := params.get("subbranch"):
        queryset = queryset.filter(subbranch__icontains=subbranch)

    if is_customer := params.get("is_customer"):
        if is_customer.lower() in ["true", "1"]:
            queryset = queryset.filter(is_customer=True)
        elif is_customer.lower() in ["false", "0"]:
            queryset = queryset.filter(is_customer=False)

    if division_id := params.get("division_id"):
        queryset = queryset.filter(division_id=division_id)
    if subdivision_id := params.get("subdivision_id"):
        queryset = queryset.filter(subdivision_id=subdivision_id)
    if branch_id := params.get("branch_id"):
        queryset = queryset.filter(branch_id=branch_id)
    if assign_to := params.get("assign_to"):
        queryset = queryset.filter(assign_to_id=assign_to)

    visit_from = params.get("visit_from")
    visit_to = params.get("visit_to")
    if visit_from and visit_to:
        queryset = queryset.filter(tentetive_visit_date__range=[visit_from, visit_to])
    elif visit_from:
        queryset = queryset.filter(tentetive_visit_date__gte=visit_from)
    elif visit_to:
        queryset = queryset.filter(tentetive_visit_date__lte=visit_to)

    created_from = params.get("created_from")
    created_to = params.get("created_to")
    if created_from and created_to:
        queryset = queryset.filter(created_at__range=[created_from, created_to])
    elif created_from:
        queryset = queryset.filter(created_at__gte=created_from)
    elif created_to:
        queryset = queryset.filter(created_at__lte=created_to)

    return queryset

#Export Main function

@api_view(["GET"])
def export_leads(request):
    token = decodeToken(request)
    if token.get('error'):
        return sendError(token.get("message"))
    try:
        queryset = Lead.objects.all()
        queryset = apply_lead_filters(queryset, request.GET)

        data = []
        for lead in queryset:
            data.append({
            "Name": lead.name,
            "Contact": lead.contact,
            "Email": lead.email,
            "Gender": lead.gender,
            "Address": lead.address,
            "City": lead.city,
            "Landmark": lead.landmark,
            "Pan/Vat": lead.pan_vat,
            "Company Name": lead.company_name,
            "Subbranch": lead.subbranch,
            "Lead Type": lead.lead_type,
            "Source": lead.source,
            "Category": lead.category,
            "Division": lead.division.name if lead.division else "",
            "Subdivision": lead.subdivision.name if lead.subdivision else "",
            "Branch": lead.branch.name if lead.branch else "",
            "Assigned To": lead.assign_to.full_name if lead.assign_to else "",
            "Is Customer": "Yes" if lead.is_customer else "No",
            "Tentative Visit Date": lead.tentetive_visit_date.strftime("%Y-%m-%d %H:%M") if lead.tentetive_visit_date else "",
            "Tentative Purchase Date": lead.tentetive_purchase_date.strftime("%Y-%m-%d %H:%M") if lead.tentetive_purchase_date else "",
            "Created At": lead.created_at.strftime("%Y-%m-%d %H:%M") if lead.created_at else "",
        })

        df = pd.DataFrame(data)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=leads_export.csv"
        df.to_csv(path_or_buf=response, index=False)
        return response
    except Exception as e:
        print(e)
        return sendError(f"{e}")