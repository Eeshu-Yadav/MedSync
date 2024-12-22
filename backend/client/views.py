from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from twilio.rest import Client
from datetime import datetime
from .models import Patient, PatientAppointment
from doctor.models import AppointmentSlot
from .serializers import PatientSerializer, PatientAppointmentSerializer
from doctor.serializers import AppointmentSlotSerializer
import random
import environ

# Load environment variables
env = environ.Env()
environ.Env.read_env()

TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = env("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ----------------------------
# Patient Registration and OTP
# ----------------------------

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile_number = request.data.get("mobile_number")
        name = request.data.get("name")

        if not mobile_number:
            return Response({"error": "Mobile number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the patient is already registered
        if Patient.objects.filter(mobile_number=mobile_number).exists():
            otp = str(random.randint(1000, 9999))
            cache.set(f"otp_patient_{mobile_number}", otp, timeout=300)  # OTP expires in 5 minutes

            try:
                client.messages.create(
                    body=f"Your OTP is {otp}",
                    from_=TWILIO_PHONE_NUMBER,
                    to=mobile_number
                )
                return Response({"message": "OTP sent successfully for login"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # If not registered, create a new patient and send OTP
            if not name:
                return Response({"error": "Name is required for signup"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=mobile_number, password="temporary_password")
            patient = Patient.objects.create(mobile_number=mobile_number, name=name, user=user)
            otp = str(random.randint(1000, 9999))
            cache.set(f"otp_patient_{mobile_number}", otp, timeout=300)

            try:
                client.messages.create(
                    body=f"Your OTP is {otp}",
                    from_=TWILIO_PHONE_NUMBER,
                    to=mobile_number
                )
                return Response({"message": "OTP sent successfully for signup"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile_number = request.data.get("mobile_number")
        otp = request.data.get("otp")

        if not mobile_number or not otp:
            return Response({"error": "Mobile number and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_patient_{mobile_number}")
        if not cached_otp:
            return Response({"error": "OTP expired or not generated"}, status=status.HTTP_400_BAD_REQUEST)

        if cached_otp != otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = Patient.objects.get(mobile_number=mobile_number)
            refresh = RefreshToken.for_user(patient.user)
            return Response({
                "message": "Login successful",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found, please register first"}, status=status.HTTP_404_NOT_FOUND)


# ----------------------------
# Patient Profile Management
# ----------------------------

class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_uuid):
        try:
            patient = Patient.objects.get(uuid=patient_uuid)
            serializer = PatientSerializer(patient)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, patient_uuid):
        try:
            patient = Patient.objects.get(uuid=patient_uuid)
            serializer = PatientSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                if 'mobile_number' in request.data:
                    return Response({"error": "Mobile number cannot be updated"}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Patient.DoesNotExist:
            return Response({"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND)


# ----------------------------
# Appointment Management
# ----------------------------

class AvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            slots = AppointmentSlot.objects.filter(is_open=True).order_by("start_time")
            serializer = AppointmentSlotSerializer(slots, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.data)
        slot_uuid = request.data.get("slot_uuid")
        print(slot_uuid)

        if not slot_uuid:
            return Response({"error": "Slot UUID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use `uuid` instead of `id`
            slot = AppointmentSlot.objects.get(uuid=slot_uuid, is_open=True)

            if slot.current_patients >= slot.max_patients:
                return Response({"error": "Slot is fully booked"}, status=status.HTTP_400_BAD_REQUEST)

            patient = Patient.objects.get(user=request.user)
            appointment = PatientAppointment.objects.create(
                slot=slot,
                patient=patient
            )
            slot.current_patients += 1
            if slot.current_patients == slot.max_patients:
                slot.is_open = False
            slot.save()

            return Response({
                "message": "Appointment booked successfully",
                "appointment_id": appointment.id  # Fix incorrect reference
            }, status=status.HTTP_201_CREATED)
        except AppointmentSlot.DoesNotExist:
            return Response({"error": "Slot not found or not open"}, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)


class AppointmentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
            appointments = PatientAppointment.objects.filter(patient=patient).order_by("-slot__start_time")
            serializer = PatientAppointmentSerializer(appointments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        


class GetUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch the logged-in user's doctor details
            doctor = Patient.objects.get(user=request.user)
            serializer = PatientSerializer(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND)
