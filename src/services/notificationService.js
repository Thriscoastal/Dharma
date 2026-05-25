import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    await notifee.requestPermission();
  }
};

export const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'dharma-daily',
      name: 'Daily Sloka',
      importance: 4,
      sound: 'default',
    });
  }
};

export const scheduleNotification = async (hour, minute) => {
  try {
    await notifee.cancelAllNotifications();

    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    // If the time has passed today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        title: '🕉️ Dharma - Bhagavad Gita',
        body: "Today's Gita Sloka is ready 📖",
        android: {
          channelId: 'dharma-daily',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger
    );

    console.log('Notification scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelNotifications = async () => {
  try {
    await notifee.cancelAllNotifications();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};
