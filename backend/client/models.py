# from django.db import models
# from doctor.models import AppointmentSlot
# from django.core.validators import RegexValidator

# class Patient(models.Model):
#     name = models.CharField(max_length=255)
#     mobile_number = models.CharField(
#         max_length=13,unique=True,
#         validators=[
#             RegexValidator(
#                 regex=r'^\+91[6-9]\d{9}$',
#                 message="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
#             )
#         ]
#     )

#     def __str__(self):
#         return self.name


# class PatientAppointment(models.Model):
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
#     slot = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE, related_name="appointments")
#     registration_time = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ('patient', 'slot')  # Ensure no duplicate appointments for a patient in a slot

#     def __str__(self):
#         return f"{self.patient.name} in slot {self.slot.id}"



from django.db import models
from doctor.models import AppointmentSlot
from django.core.validators import RegexValidator
import uuid
from django.contrib.auth.models import User



class Patient(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE )
    name = models.CharField(max_length=255)
    mobile_number = models.CharField(
        max_length=13,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+91[6-9]\d{9}$',
                message="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
            )
        ]
    )

    def __str__(self):
        return self.name


class PatientAppointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    slot = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE, related_name="appointments")
    registration_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'slot')  # Ensure a patient cannot register for the same slot multiple times
        ordering = ['registration_time']  # Order appointments by registration time

    def __str__(self):
        return f"{self.patient.name} in slot {self.slot.id} ({self.slot.start_time} - {self.slot.end_time})"
