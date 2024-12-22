from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime,timedelta
from rest_framework import status
from .models import Doctor, AppointmentSlot
from .serializers import DoctorSerializer, AppointmentSlotSerializer
from django.utils.timezone import now, make_aware
from .tasks import  start_scheduled_timer, close_timer
from twilio.rest import Client
# from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import BasePermission
import random
from django.core.cache import cache
from django.contrib.auth import authenticate
import environ
from django.core.validators import RegexValidator
from rest_framework.permissions import BasePermission
from pytz import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
import pytz
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
env = environ.Env()
environ.Env.read_env()


TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = env("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)



class GetUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch the logged-in user's doctor details
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND)

class SendOTPView(APIView):
    authentication_classes = []  # No authentication required
    permission_classes = [AllowAny]  # Allows unauthenticated access
    
    def post(self, request):
        mobile_number = request.data.get("mobile_number")
        name = request.data.get("name")

        if not mobile_number:
            return Response({"error": "Mobile number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is already registered
        if Doctor.objects.filter(mobile_number=mobile_number).exists():
            # If registered, send OTP for signin
            otp = str(random.randint(1000, 9999))
            cache.set(f"otp_doctor_{mobile_number}", otp, timeout=3000)  # Store OTP in cache

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
            # If not registered, create a new user and send OTP for signup
            if not name:
                return Response({"error": "Name is required for signup"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=mobile_number, password="temporary_password")
            doctor = Doctor.objects.create(mobile_number=mobile_number, name=name, user=user)
            otp = str(random.randint(1000, 9999))
            cache.set(f"otp_doctor_{mobile_number}", otp, timeout=3000)

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
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        mobile_number = request.data.get("mobile_number")
        otp = request.data.get("otp")

        if not mobile_number or not otp:
            return Response({"error": "Mobile number and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_doctor_{mobile_number}")
        if not cached_otp:
            return Response({"error": "OTP expired or not generated"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        if cached_otp != otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if the doctor is already registered (for login)
            doctor = Doctor.objects.get(mobile_number=mobile_number)
        except Doctor.DoesNotExist:
            # If doctor is not found, it means they are trying to log in without being registered
            return Response({"error": "Doctor not found, please register first"}, status=status.HTTP_404_NOT_FOUND)

        # If OTP is correct, generate JWT tokens and log in
        refresh = RefreshToken.for_user(doctor.user)
        return Response({
            "message": "Login successful",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }, status=status.HTTP_200_OK)

class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, doctor_uuid):
        print(request.user)
        try:
            doctor = Doctor.objects.get(uuid=doctor_uuid)
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, doctor_uuid):
        try:
            doctor = Doctor.objects.get(uuid=doctor_uuid)
            serializer = DoctorSerializer(doctor, data=request.data, partial=True)  # Allows partial updates
            if serializer.is_valid():
                # Ensure mobile_number remains unchanged
                if 'mobile_number' in request.data:
                    return Response({"error": "Mobile number cannot be updated"}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)



class AppointmentSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = Doctor.objects.get(user=request.user)
        slots = AppointmentSlot.objects.filter(doctor=doctor)
        serializer = AppointmentSlotSerializer(slots, many=True)
        return Response(serializer.data)
    
    
    def post(self, request):
        print(request.data)
        doctor = Doctor.objects.get(user=request.user)
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        max_patients = request.data.get("max_patients")

        
        if not start_time or not end_time or not max_patients:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doctor = Doctor.objects.get(user=request.user)
            overlapping_slots = AppointmentSlot.objects.filter(
                doctor=doctor,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            if overlapping_slots.exists():
                return Response({"error": "There is an overlapping slot. Choose a different time."}, status=status.HTTP_400_BAD_REQUEST)



            slot = AppointmentSlot.objects.create(
                doctor=doctor,
                start_time=start_time,
                end_time=end_time,
                max_patients=max_patients,
                is_open=False,
            )
            return Response({"message": "Slot created successfully", "slot_id": slot.id}, status=status.HTTP_201_CREATED)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, slot_uuid):
        try:
            slot = AppointmentSlot.objects.get(uuid=slot_uuid)
            if request.user != slot.doctor:
                return Response({"error": "You can only modify your own slots."}, status=status.HTTP_403_FORBIDDEN)

            slot.is_open = False
            slot.save()
            return Response({"message": "Slot closed successfully", "slot_id": slot.id}, status=status.HTTP_200_OK)
        except AppointmentSlot.DoesNotExist:
            return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)


IST = timezone('Asia/Kolkata')
class StartTimerView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, slot_uuid):
        print(request.data)
        try:
            # slot = AppointmentSlot.objects.get(id=slot_id)
            slot = AppointmentSlot.objects.get(uuid=slot_uuid)
            print(slot)
            print(f"Authenticated User ID: {request.user.id}")
            print(f"Slot's Doctor ID: {slot.doctor.id}")
            if request.user.id != slot.doctor.user.id:
                return Response({"error": "You can only start the timer for your own slots."}, status=status.HTTP_403_FORBIDDEN)
            
            duration = int(request.data.get("duration", 5))
            print(duration)
            start_now = request.data.get("start_now", False)
            scheduled_start_time = request.data.get("scheduled_start_time", None)
            print(scheduled_start_time)

            if start_now:
                # Start timer immediately
                current_time = now().astimezone(IST)
                slot.start_time = current_time
                # print(slot.start_time)
                slot.duration = duration
                # print(slot.duration)
                slot.end_time = current_time + timedelta(minutes=duration)
                # print(slot.end_time)
                slot.is_open = True
                slot.scheduled_start_time = None
                slot.save()
                print("Timer started immediately.")

                close_timer.apply_async((slot.id,), eta=slot.end_time)

                # Response
                return Response(
                    {"message": f"Timer started for {duration} minutes","start_time": slot.start_time, "end_time": slot.end_time},
                    status=status.HTTP_200_OK
                )

            elif scheduled_start_time:
                # Validate and schedule the timer
                # Convert scheduled_start_time from string to datetime object
                try:
                    scheduled_start_time_naive = datetime.strptime(scheduled_start_time, "%Y-%m-%dT%H:%M")
                    print(f"Scheduled Start Time (in naive): {scheduled_start_time_naive}")
                    scheduled_start_time = IST.localize(scheduled_start_time_naive)
                    print(f"Scheduled Start Time (IST): {scheduled_start_time}")
                except ValueError as e:
                    print(f"Error: {e}")
                    return Response({"error": "Invalid scheduled_start_time format. Use ISO 8601 format"}, status=status.HTTP_400_BAD_REQUEST)
                current_time = now().astimezone(IST)
                print(f"Current Time (IST): {current_time}")
                if scheduled_start_time <= current_time:
                    return Response(
                        {"error": "Scheduled start time must be in the future."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                slot.scheduled_start_time = scheduled_start_time
                print(slot.scheduled_start_time)
                slot.duration = duration
                print(slot.duration)
                slot.is_open = False  # Open only when the timer starts
                slot.save()

                end_time = scheduled_start_time + timedelta(minutes=duration)
                print(f"End Time (calculated): {end_time}")

                # Trigger Celery to start the timer at the scheduled time
                start_scheduled_timer.apply_async((slot.id,duration), eta=scheduled_start_time)
                print("Timer scheduled successfully.")
                return Response(
                    {"message": f"Timer scheduled to start at {scheduled_start_time} for {duration} minutes",
                    "start_time": scheduled_start_time.isoformat(),
                    "end_time": end_time.isoformat(),},
                    status=status.HTTP_200_OK
                )

            else:
                # If neither `start_now` nor `scheduled_start_time` is provided
                return Response(
                    {"error": "Invalid request. Provide either start_now=True or a scheduled_start_time."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # return Response({"error": "Invalid request. Specify start_now or scheduled_start_time."},
            #                     status=status.HTTP_400_BAD_REQUEST)
        
        except AppointmentSlot.DoesNotExist:
            return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ActiveSlotsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get current time in IST
            current_time = now().astimezone(IST)
            
            # Get slots that are either:
            # 1. Currently active (between start and end time)
            # 2. Scheduled for the future
            active_slots = AppointmentSlot.objects.filter(
                doctor__user=request.user
            ).filter(
                Q(is_open=True) |  # Currently active slots
                Q(scheduled_start_time__isnull=False)  # Scheduled slots
            ).order_by('start_time')
            
            slots_data = [{
                'uuid': str(slot.uuid),
                'start_time': slot.start_time,
                'end_time': slot.end_time,
                'duration': slot.duration,
                'is_open': slot.is_open,
                'scheduled_start_time': slot.scheduled_start_time
            } for slot in active_slots]
            
            return Response({
                'slots': slots_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Blacklist the token
                return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

