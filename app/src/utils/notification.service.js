import firebase from "react-native-firebase";
import { UserManagementServiceAPI } from "../api";

export default class NotificationService {
  async retrieveDeviceToken(userId) {
    // const deviceToken = await firebase.messaging().getToken();

    const hasPermission = await firebase.messaging().hasPermission();

    if (!hasPermission) {
      this.requestNotificationPermission();
    }

    const deviceToken = await firebase.messaging().getToken();
    if (deviceToken) {
      console.log(`[NotifySVC] Current FCM Device Token: ${deviceToken}`);
      // retrieve device token and process further with API services
      this.registerDeviceToken(deviceToken, userId);
      return;
    }
    // const hasPermission = await firebase.messaging().hasPermission();

    // if(!hasPermission) {
    //     this.requestNotificationPermission();
    // }
  }

  async requestNotificationPermission() {
    const permissionConsent = await firebase.messaging().requestPermission();

    if (permissionConsent) {
      this.retrieveDeviceToken();
    }
  }

  monitorDeviceTokenRefresh(userId) {
    return firebase.messaging().onTokenRefresh(fcmToken => {
      console.log(`[NotifySVC] New FCM Device Token: ${fcmToken}`);
      this.registerDeviceToken(fcmToken, userId);
    });
  }

  async registerDeviceToken(deviceToken, userId) {
    const userSvc = new UserManagementServiceAPI();

    const userDeviceIds = await userSvc.getUserDetailsByFieldAPI(
      userId,
      "deviceTokens"
    );

    if (userDeviceIds && !userDeviceIds.includes(deviceToken)) {
      userDeviceIds.push(deviceToken);
      return userSvc.updateUserDetailsAPI(userId, {
        deviceTokens: userDeviceIds
      });
    }
  }

  listenForDataMsgs() {
    return new Promise((resolve, reject) => {
      return firebase.messaging().onMessage(message => {
        //console.log("++ Notification data msg ++", message);
        //const { event_id, host_id, type } = message._data;
        resolve(message._data);
      });
    });
  }

  listenForNotification() {
    return firebase.notifications().onNotification(notification => {

      const thisNotification = new firebase.notifications.Notification()
        .setNotificationId(notification._notificationId)
        .setTitle(notification._title)
        .setData(notification._data)
        .android.setLargeIcon('ic_launcher')
        .android.setChannelId('channel');

      firebase.notifications().displayNotification(thisNotification);
      //console.log("++ Notification msg ++", notification);
      //const { event_id, host_id, type } = notification._data;
    });
  }

  listenForNotificationDisplayed() {
    return firebase.notifications().onNotificationDisplayed(notification => {
      //console.log("++ Notification msg displayed ++", notification);
      //const { event_id, host_id, type } = notification._data;
    });
  }

  listenForNotificationDidOpen() {
    return new Promise((resolve, reject) => {
      return firebase
        .notifications()
        .onNotificationOpened(notificationOpened => {
          resolve(notificationOpened.notification);
        });
    });
  }

  async listenForBackgroundNotification() {
    const notificationOpened = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpened) {
      return new Promise((resolve, reject) => {
        resolve(notificationOpened.notification);
      });
    }
  }
}
