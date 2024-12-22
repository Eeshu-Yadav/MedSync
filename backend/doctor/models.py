from django.db import models
from django.contrib.auth.models import User,AbstractBaseUser
from django.core.validators import RegexValidator
from datetime import timedelta
from django.utils.timezone import now
from django.forms import ValidationError
import uuid


class Doctor(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    user = models.OneToOneField(User, on_delete=models.CASCADE )
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    mobile_number = models.CharField(
        max_length=13,unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+91[6-9]\d{9}$',
                message="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
            )
        ]
    )

    def __str__(self):
        return self.name


class AppointmentSlot(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="slots")
    start_time = models.DateTimeField(null=True, blank=True)
    scheduled_start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)
    max_patients = models.PositiveIntegerField(null=False, blank=False)
    current_patients = models.PositiveIntegerField(default=0)
    is_open = models.BooleanField(default=True)

    def clean(self):
        if self.scheduled_start_time and self.scheduled_start_time <= now():
            raise ValidationError("Scheduled start time must be in the future.")

    def save(self, *args, **kwargs):
        if self.start_time and self.duration:
            self.end_time = self.start_time + timedelta(minutes=self.duration)
        super().save(*args, **kwargs)
    
    
    # def __str__(self):
    #     return f"Slot by {self.doctor} ({self.timer_duration} mins) from {self.start_time} to {self.end_time}"
