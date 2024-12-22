from django.urls import path
from .views import DoctorProfileView, StartTimerView, SendOTPView, VerifyOTPView,AppointmentSlotView, GetUserDetailsView, ActiveSlotsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path("signup/", SendOTPView.as_view(), name="send_otp"),
    path("verify_otp/", VerifyOTPView.as_view(), name="verify_otp"),
    # path('login/', LoginView.as_view(), name='login'),
    path('user/details/', GetUserDetailsView.as_view(), name="get-user-details"),
    path('profile/<uuid:doctor_uuid>/', DoctorProfileView.as_view(), name="doctor-profile"),
    path('doctor_Update/', DoctorProfileView.as_view(), name="doctor-profile"),
    
    path('appointment_slot/', AppointmentSlotView.as_view(), name="create-slot"),
    path('appointment_slot/<uuid:slot_uuid>/', AppointmentSlotView.as_view(), name="modify_slot"),
    path('start_timer/<uuid:slot_uuid>/', StartTimerView.as_view(), name="start-timer"),
    path('active-slots/', ActiveSlotsView.as_view(), name='active-slots'),
]
