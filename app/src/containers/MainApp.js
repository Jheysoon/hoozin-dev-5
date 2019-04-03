/* core modules */
import { StackNavigator } from "react-navigation";
import firebase from "firebase";

/* Environment specific configs */
import { FIREBASE_DEV_CONF } from "../environments/environment.dev";

/* App routes */
import LoginContainer from "./Login/login.index";
import NearbyEventsComponent from "../components/NearbyEvents/nearbyevents.index";
import MenuPage from "./MenuPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ProfilePage from "./Profile/create-profile/create-profile.index";
import EditProfile from "./Profile/edit-profile/edit-profile.index";
import ShowProfile from "./Profile/view-profile/view-profile.index";
import AboutPage from "./Menu/AboutPage";
import Feedback from "./Menu/FeedbackPage";
import AddEvent from "./Event/AddEvent/AddEvent.index";
import AddInvitee from "./Event/AddInvitee/AddInvitee.index";
import ConfirmEvent from "./Event/EventConfirm/EventConfirm.index";
import EventList from "./Event/EventList";
import EventDetail from "./Event/EventDetail/EventDetail.index";
import EventOverview from "./Event/EventOverview/EventOverview.index";
import EventMap from "./Event/EventMap";
import EventActiveMap from "./Event/EventActiveMap/EventActiveMap.index";
import EventActiveUser from "./Event/EventActiveUser";
import EventActiveAttendees from "./Event/EventActiveAttendees";
import EventActiveGallery from "./Event/EventGallery/EventGallery";
import EventCamera from "./Event/EventCamera/EventCamera";
import EventActiveChatContainer from "./Event/EventActiveChat";
import TabNavigation from "./TabNavigation";
import AddDeviceUserContainer from "./AddUser/AddDeviceUser";
import AddFacebookUserContainer from "./AddUser/AddFacebookUser";
import AddNewUserContainer from "./AddUser/AddNewUser";
import TabScreen from "./TabScreen";

firebase.initializeApp(FIREBASE_DEV_CONF);

const MainAppContainer = StackNavigator(
  {
    Login: { screen: LoginContainer },
    NearbyEvents: { screen: NearbyEventsComponent },
    Menu: { screen: MenuPage },
    ForgotPassword: { screen: ForgotPasswordPage },
    Profile: { screen: ProfilePage },
    EditProfile: { screen: EditProfile },
    ShowProfile: { screen: ShowProfile },
    About: { screen: AboutPage },
    Feedback: { screen: Feedback },
    AddEvent: { screen: AddEvent },
    AddInvitee: { screen: AddInvitee },
    ConfirmEvent: { screen: ConfirmEvent },
    EventList: { screen: EventList },
    EventDetail: { screen: EventDetail },
    EventOverview: { screen: EventOverview },
    EventMap: { screen: EventMap },
    EventActiveMap: { screen: EventActiveMap },
    EventActiveUser: { screen: EventActiveUser },
    EventActiveAttendees: { screen: EventActiveAttendees },
    EventActiveGallery: { screen: EventActiveGallery },
    EventCamera: { screen: EventCamera },
    EventActiveChat: { screen: EventActiveChatContainer },
    TabNavigation: { screen: TabNavigation },
    AddDeviceUser: { screen: AddDeviceUserContainer },
    AddFacebookUser: { screen: AddFacebookUserContainer },
    AddNewUser: { screen: AddNewUserContainer },
    TabScreen: { screen: TabScreen }
  },
  {
    initialRouteName: "Login",
    navigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default MainAppContainer;
