import React, { Component } from "react";
import { Formik } from "formik";
import { View, Text } from "react-native";
import { Container, Content } from "native-base";
import { connect } from "react-redux";
import { UIActivityIndicator } from "react-native-indicators";

import { upsertEventDataAction } from "../../../actions/event";
import {
  setVisibleIndicatorAction,
  resetProfileUpdateAction
} from "../../../actions/auth";
import { EventServiceAPI } from "../../../api/index";
import AppBarComponent from "../../../components/AppBar/appbar.index";

// stylesheet
import { AddOrCreateEventStyles } from "./addevent.style";
import AddEventForm from "./AddEventForm";
import { validate } from "./validate";

/* Redux container component to create a new event or edit a particular event */
class CreateOrEditEventContainer extends Component {
  static navigationOptions = {
    header: null
  };

  constructor() {
    super();
    this.state = {
      chosenDate: new Date(),
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      eventTitle: "",
      eventType: "",
      location: "",
      privateValue: true,
      status: "inProgress",
      animating: false,
      eventId: "",
      isEditMode: false,
      isEventFormEmpty: false,
      evtCoords: null,
      textInputHeight: 0
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * @description Purpose - get event information to edit that event
   */
  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.props.resetProfileUpdate();
    this.setState({ animating: false });
    if (!!params && !!params.eventId) {
      this.fetchEventInfo(params.eventId);
      this.setState({ isEditMode: params.isEditMode, eventId: params.eventId });
    } else {
      this.setState({ isEditMode: false, eventId: "" });
    }
  }

  componentWillReceiveProps(nextProps) {
    //console.log("@@@ Add event nextprops", nextProps);
    const { eventAdded, eventId, indicatorShow, profileUpdate } = nextProps;
    const { replace, navigate, getParam } = this.props.navigation;

    if (indicatorShow != this.state.animating) {
      this.setState({ animating: indicatorShow });
    }

    // TODO - compact the outer condition or remove it if it not necessary
    if (
      (eventAdded &&
        profileUpdate == false &&
        eventId != this.props.eventId &&
        !this.state.isEditMode) ||
      (eventAdded && this.state.isEditMode)
    ) {
      this.setState({ animating: false });
      if (eventAdded && profileUpdate == false && !this.state.isEditMode) {
        replace("AddInvitee", {
          searchType: "start",
          account: getParam("account"),
          eventKey: eventId
        });
        return;
      } else if (
        eventAdded &&
        profileUpdate == false &&
        eventId != (this.props.eventId || "undefined") &&
        this.props.navigation.state.params.eventId
      ) {
        // changed on 25.09.2018 because of wrong Event edit mode navigation becuase of not cache editmode flag
        replace("AddInvitee", {
          includeInvitees: true,
          eventKey: this.state.eventId,
          editMode: this.state.isEditMode
        });
        return;
      }
    }
  }

  /**
   * @description Fetches event information if event key is supplied
   * @param {string} eventId
   */
  fetchEventInfo(eventId) {
    const eventSvc = new EventServiceAPI();
    eventSvc
      .getEventDetailsAPI(eventId, this.props.user.socialUID)
      .then(eventData => {
        delete eventData.invitee;
        delete eventData.invite_sent;
        delete eventData.status;
        eventData["eventId"] = eventId;
        this.setState(eventData);
        // TODO - This is where result will be cached later
      })
      .catch(err => console.error(err));
  }

  goBackToOverview() {
    const eventSvc = new EventServiceAPI();

    eventSvc
      .updateEventAPI(this.props.user.socialUID, this.state.eventId, {
        status: "confirmed"
      })
      .then(result => this.props.navigation.goBack());
  }

  /**
   * @description Create or Update new / existing event
   */
  onSubmit(values, actions) {
    this.props.onShowIndicator(true);
    this.setState({ animating: true });
    values = {
      ...values,
      status: this.state.isEditMode ? "Editing" : this.state.status,
      socialUID: this.props.user.socialUID,
      eventId: this.state.eventId ? this.state.eventId : ""
    };

    this.props.upsertEventDataAction(values);
  }

  render() {
    const initialValues = {
      privateValue: this.state.privateValue,
      eventTitle: this.state.eventTitle,
      eventType: this.state.eventType,
      startDate: this.state.startDate,
      startTime: this.state.startTime,
      endDate: this.state.endDate,
      endTime: this.state.endTime,
      location: this.state.location
    };

    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent />
          <Content>
            <View style={{ padding: 10, alignSelf: "center" }}>
              <Text style={AddOrCreateEventStyles.textStyle}>
                Start by entering your event details here
              </Text>
            </View>

            <Formik
              initialValues={initialValues}
              validate={validate}
              onSubmit={this.onSubmit}
              enableReinitialize={true}
              render={props => (
                <AddEventForm
                  form={props}
                  isEditMode={this.state.isEditMode}
                  eventId={this.state.eventId}
                />
              )}
            />
          </Content>
        </Container>
        {this.state.animating && (
          <View style={AddOrCreateEventStyles.overlay}>
            <UIActivityIndicator
              color={"lightgoldenrodyellow"}
              style={AddOrCreateEventStyles.spinner}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    eventAdded: state.event.eventAdded,
    eventId: state.event.eventId,
    user: state.auth.user,
    indicatorShow: state.auth.indicatorShow,
    profileUpdate: state.auth.profileUpdate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    upsertEventDataAction: values => {
      dispatch(upsertEventDataAction(values));
    },
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    resetProfileUpdate: () => {
      dispatch(resetProfileUpdateAction());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateOrEditEventContainer);
