from rest_framework import serializers
from .models import Followup

class FollowupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Followup
        fields = [
            'followup_id', 'lead', 'user', 'followup_date', 'followup_remarks', 
            'followup_type', 'status', 'notes', 'entry_date', 
            'updated_at', 'completed_at'
        ]
        read_only_fields = ['followup_id', 'entry_date'] 