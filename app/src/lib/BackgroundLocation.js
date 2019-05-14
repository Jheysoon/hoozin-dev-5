import { AsyncStorage } from "react-native";
import Permissions from "react-native-permissions";
import BackgroundGeolocation from "react-native-mauron85-background-geolocation";

let watchId = null;

/**
 * @deprecated must be delete this file
 */
class BackgroundLocation {
  async run() {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 100,
      distanceFilter: 100,
      debug: false,
      startOnBoot: true,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 10000,
      activitiesInterval: 50000,
      stopOnStillActivity: true,
      url: "",
      notificationsEnabled: false,
      startForeground: true,
      httpHeaders: {
        "X-FOO": "bar"
      },
      // customize post properties
      postTemplate: {
        lat: "@latitude",
        lng: "@longitude",
        foo: "bar" // you can also add your own properties
      }
    });

    BackgroundGeolocation.on("location", location => {
      BackgroundGeolocation.startTask(taskKey => {
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    

    /* BackgroundGeolocation.on("background", async () => {
      console.log("[INFO] App is in background");

      let permission = await Permissions.check("location", "whenInUse");

      if (permission == "authorized") {
        // add a workaround for now...
        // @TODO research for the plugin to not run first the background

        navigator.geolocation.setRNConfiguration({
          skipPermissionRequests: true
        });

        if (watchId == null) {
          watchId = navigator.geolocation.watchPosition(data => {
            AsyncStorage.getItem("userId").then(userIdString => {
              const { uid: userId } = JSON.parse(userIdString);
  
              this.props.changeLocation(userId, data.coords);
            });
          });
        }
        
      }
    }); */

    BackgroundGeolocation.checkStatus(status => {
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  }
}

export default BackgroundLocation;
