from django.contrib import admin
from .models import Patient, PatientAppointment
from doctor.models import Doctor, AppointmentSlot
from django.utils.timezone import localtime, now

# Register Patient model
class PatientAdmin(admin.ModelAdmin):
    list_display = ('uuid','name', 'mobile_number')
    search_fields = ('user','mobile_number')

admin.site.register(Patient, PatientAdmin)

# Register PatientAppointment model
class PatientAppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'slot', 'registration_time')
    list_filter = ('slot__doctor', 'slot__start_time', 'patient')
    search_fields = ('patient__name',)

admin.site.register(PatientAppointment, PatientAppointmentAdmin)

# Register Doctor model
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('uuid','name', 'specialty', 'mobile_number')
    search_fields = ('name', 'specialty', 'mobile_number')

admin.site.register(Doctor, DoctorAdmin)


class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'doctor', 
                    'formatted_start_time', 'formatted_end_time', 
                    'max_patients',"current_patients", 'is_open')
    list_filter = ('doctor',  'is_open')
    list_filter = ('doctor', 'scheduled_start_time', 'is_open')
    search_fields = ('doctor__name',)
    # ordering = ('scheduled_start_time',)

    readonly_fields = ('end_time',)

    def formatted_scheduled_start_time(self, obj):
        return localtime(obj.scheduled_start_time).strftime('%Y-%m-%d %I:%M %p')
    formatted_scheduled_start_time.short_description = 'Scheduled Start Time'

    def formatted_start_time(self, obj):
        return localtime(obj.start_time).strftime('%Y-%m-%d %I:%M %p')
    formatted_start_time.short_description = 'Start Time'

    def formatted_end_time(self, obj):
        return localtime(obj.end_time).strftime('%Y-%m-%d %I:%M %p')
    formatted_end_time.short_description = 'End Time'

    def get_readonly_fields(self, request, obj=None):
        if obj:  # If editing an existing object
            return self.readonly_fields + ('doctor', 'start_time',  'duration', 'max_patients')
            # return self.readonly_fields + ('doctor', 'start_time', 'scheduled_start_time', 'duration', 'max_patients')
        return self.readonly_fields
    
admin.site.register(AppointmentSlot, AppointmentSlotAdmin)