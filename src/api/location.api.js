import { UserManagementServiceAPI } from './users.api';

export class LocationServiceAPI {

    /**
     * @description watch user location if the user allowed location share
     * @param {string} userId 
     */
    watchUserLocation(userId) {
        navigator.geolocation.watchPosition(
            position => {
                // insert user location
                this.updateUserLocation(userId, position.coords);
            }, 
            error => {
                console.log(error);
            },
            {
                enableHighAccuracy: true
            }
        );
    }

    /**
     * @description update user location
     * @param {string} userId 
     * @param {*} coordinate 
     */
    async updateUserLocation(userId, coordinate) {
        const userSvc = new UserManagementServiceAPI();
        const payload = { userLocation: { lat: coordinate.latitude, lng: coordinate.longitude }};
        const updateOpResult = await userSvc.updateUserDetailsAPI(userId, payload);
    }

    testAndPingService() {
        console.log("[LocationAPI] hello world!");
    }
}