from rest_framework import serializers
from .models import Doctor, AppointmentSlot
from client.models import Patient , PatientAppointment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ['uuid']


class AppointmentSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSlot
        fields = '__all__'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print(f'attrs in CustomTokenObtainPairSerializer:', attrs)
        data = super().validate(attrs)
        
        data['doctor_id'] = self.user.doctor.id  # Assuming each user has a related `doctor` profile
        print(f'data in CustomTokenObtainPairSerializer:', data)
        return data
    
    