from datetime import datetime
from pickle import NONE


#Normalizes empty/null strings to None
def clean_values(val):
    if val in [None, "", "null"]:
        return None
    return val


#Parses a date string to a datetime object
def parsed_date(date_str):
    try:
        if not date_str:
            return None
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M")
    except ValueError:
        return None

#Retrieves a foreign key instance from the database
def get_fk_instance(model, lookup_field, value):
    try:
        if not value:
            return NONE
        return model.objects.get(**{lookup_field: value})
    except model.DoesNotExist:
        return NONE