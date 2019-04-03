/**
 * A barrel that contains all the API service that the app consumes.
 * Later it will be served to to the Redux middleware for further scalibility
 */
import { AuthServiceAPI } from './auth';
import { UserManagementServiceAPI } from './users.api'
import { EventServiceAPI } from './events';
import { LocationServiceAPI } from './location.api';

export { AuthServiceAPI, EventServiceAPI, UserManagementServiceAPI, LocationServiceAPI }