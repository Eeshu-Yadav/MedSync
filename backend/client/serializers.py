from rest_framework import serializers
from .models import Patient, PatientAppointment

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class PatientAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientAppointment
        fields = '__all__'
