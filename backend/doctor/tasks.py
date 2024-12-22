from celery import shared_task
from django.utils.timezone import now,make_aware
from doctor.models import AppointmentSlot
from datetime import datetime, timedelta
import pytz
import logging

logger = logging.getLogger(__name__)
IST = pytz.timezone('Asia/Kolkata')
@shared_task
def start_scheduled_timer(slot_id, duration, scheduled_start_time=None):
    try:
        slot = AppointmentSlot.objects.get(id=slot_id)
        print(slot)
        print("Slot found in tasks.")

        if scheduled_start_time is None:
            start_time = now()
            print(start_time)
        else:
            start_time = make_aware(datetime.strptime(scheduled_start_time, "%Y-%m-%dT%H:%M"))  # Ensure scheduled_start_time is timezone-aware
            print(start_time)

        

        # Calculate end time based on duration
        start_time = start_time.astimezone(IST)
        print(start_time)
        end_time = start_time + timedelta(minutes=duration)
        print(end_time)

        # Update the slot with start and end times
        slot.start_time = start_time
        print(f'Slot for tasks {slot.start_time}')
        slot.end_time = end_time
        print(f'End time for tasks {slot.end_time}')
        slot.duration = duration
        print(f'Duration for tasks {slot.duration}')
        slot.is_open = True
        slot.scheduled_start_time = None  # Clear the scheduled start time if it's being overridden
        slot.save()
        print("Slot saved in tasks.")


        close_timer.apply_async((slot.id,), eta=end_time)

        # Log the start of the timer
        logger.info(f"Timer started for slot {slot_id}. Start time: {start_time}, End time: {end_time}")

        return {
            'message': f'Timer started for {duration} minutes',
            'start_time': start_time,
            'end_time': end_time
        }

    except AppointmentSlot.DoesNotExist:
        logger.error(f"AppointmentSlot with ID {slot_id} does not exist.")
        return {'message': 'Slot not found'}
    
    except Exception as e:
        # Log unexpected exceptions
        logger.error(f"An error occurred while starting the timer for slot {slot_id}: {str(e)}")
        return {'message': 'An error occurred', 'error': str(e)}


@shared_task
def close_timer(slot_id):
    try:
        slot = AppointmentSlot.objects.get(id=slot_id)
        slot.is_open = False
        slot.save()
        logger.info(f"Slot {slot_id} closed after timer ended.")
        return {'message': f'Slot {slot_id} closed successfully.'}
    except AppointmentSlot.DoesNotExist:
        logger.error(f"AppointmentSlot with ID {slot_id} does not exist.")
        return {'message': 'Slot not found'}
    except Exception as e:
        logger.error(f"An error occurred while closing the slot {slot_id}: {str(e)}")
        return {'message': 'An error occurred', 'error': str(e)}
