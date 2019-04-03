/* Inject Core dependant libraries */
import moment from 'moment';
import { RNCamera } from 'react-native-camera';

/* Inject dependant API services */
import { UserManagementServiceAPI, EventServiceAPI } from '../api';

export default class CameraService {
    /**
     * @description take user picture with camera and upload to either Firebase Storage or AWS S3
     * @param {Object} cameraInstance
     * @param {string} userId
     */
    captureUserProfilePicture = async (cameraInstance, userId) => {
        if (cameraInstance) {
            // Instantiate API services
            const userSvc = new UserManagementServiceAPI();

            // Camera options
            const options = { quality: 0.5, base64: true, width: 100 };

            // Trigger camera capture
            const data = await cameraInstance.takePictureAsync(options);

            if (data) {
                // Step. 1# process the captured image (if needed)
                const imageUrlSanitized = this.processCapturedPicture(data);

                // Step. 2# generate file name
                const imageName = this.generateSnapshotName(userId);

                // Step. 3# upload the image to the web service
                return userSvc.uploadUserProfileImage(imageName, imageUrlSanitized);
            }
            console.log("[Camera SVC] camera capture error");
        }
    }

    /**
     * @description take event picture with camera and upload to either Firebase Storage or AWS S3
     * @param {Object} cameraInstance
     * @param {string} userId
     * @param {string} eventId
     */
    captureEventPicture = async (cameraInstance, userId, eventId) => {
        if (cameraInstance) {
            // Instantiate API services
            const userSvc = new UserManagementServiceAPI();
            const eventSvc = new EventServiceAPI();

            // Camera options
            const options = { quality: 0.7, base64: true, width: 320 };

            // Trigger camera capture
            const data = await cameraInstance.takePictureAsync(options);

            if (data) {
                // Step. 1# process the captured image (if needed)
                const imageUrlSanitized = this.processCapturedPicture(data);

                // Step. 2# generate file name
                const imageName = this.generateSnapshotName(userId, eventId);

                // Step. 3# upload the image to the web service
                const uploadedImageData = await userSvc.uploadEventImage(imageName, imageUrlSanitized);

                if (uploadedImageData) {
                    const payload = { id: moment.now(), imgUrl: uploadedImageData.downloadURL, pinned: false };
                    return eventSvc.updateDataToEventAPI(userId, eventId, payload, 'photos', false);
                }
            }
            console.log("[Camera SVC] camera capture error");
        }
    }

    /**
     * @description process additional processing with the capture image such as cropping, blurring, making ready for name and URL generation
     * @param {Object} cameraData 
     */
    processCapturedPicture(cameraData) {
        // remove the file:/// part from the returned URL
        return cameraData.uri.replace('file:', '');
    }

    /**
     * @description generate picture / snapshot name
     * @param {string} userId
     * @param {string=} eventId
     */
    generateSnapshotName(userId, eventId) {
        if (eventId) {
            return `event-${moment.now()}`;
        }
        return `user-${moment.now()}`;
    }
}