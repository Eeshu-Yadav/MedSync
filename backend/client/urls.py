from django.urls import path
from .views import (
    SendOTPView, VerifyOTPView, PatientProfileView, 
    AvailableSlotsView, BookAppointmentView, AppointmentHistoryView,GetUserDetailsView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', SendOTPView.as_view(), name='send_otp'),
    path('verify_otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('user/details/', GetUserDetailsView.as_view(), name="get-user-details"),
    path('profile/<uuid:patient_uuid>/', PatientProfileView.as_view(), name='patient_profile'),
    path('patient_Update/', PatientProfileView.as_view(), name="patient-profile-update"),
    path('available-slots/', AvailableSlotsView.as_view(), name='available_slots'),
    path('book-appointment/', BookAppointmentView.as_view(), name='book_appointment'),
    path('appointment-history/', AppointmentHistoryView.as_view(), name='appointment_history'),
]
