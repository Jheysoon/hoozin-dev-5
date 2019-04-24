import React from "react";
import { Field } from "formik";
import Image from "react-native-remote-svg";
import { Body, ListItem, Footer, Left, Right } from "native-base";
import { View, Text, Platform, TouchableOpacity } from "react-native";

import EventCancel from "./EventCancel";
import LocationIcon from "./LocationIcon";
import CalendarIcon from "./CalendarIcon";
import EventOverview from "./EventOverview";
import AddEventSvg from "../../../svgs/AddEvent";
import { IconsMap } from "../../../../assets/assetMap";
import { AddOrCreateEventStyles } from "./addevent.style";
import CustomTextInput from "../../../formik/CustomTextInput";
import CustomDatePicker from "../../../formik/CustomDatePicker";
import EventGooglePlaces from "../../../formik/EventGooglePlaces";
import CustomCheckBox from "./../../../formik/CustomCheckBox";

const AddEventForm = ({
  values,
  errors,
  touched,
  isSubmitting,
  handleSubmit,
  isEditMode,
  eventId
}) => {
  return (
    <React.Fragment>
      <View
        style={{
          flexDirection: "column",
          paddingTop: 15,
          paddingBottom: 15,
          paddingLeft: 30,
          paddingRight: 30
        }}
      >
        <View style={{ padding: 5 }}>
          <Field
            component={CustomTextInput}
            name="eventTitle"
            style={AddOrCreateEventStyles.textInput}
            placeholder="Event Title"
            autoCapitalize="words"
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid="transparent"
          />
          <View
            style={{
              borderBottomColor:
                touched["eventTitle"] && errors["eventTitle"]
                  ? "red"
                  : "#bcbcbc",
              borderBottomWidth: 1,
              paddingTop: 3
            }}
          />
        </View>

        <View style={{ padding: 5 }}>
          <Field
            component={CustomTextInput}
            name="eventType"
            style={AddOrCreateEventStyles.textInput}
            placeholder="Type"
            autoCapitalize="words"
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid="transparent"
          />
          <View
            style={{
              borderBottomColor:
                touched["eventType"] && errors["eventType"] ? "red" : "#bcbcbc",
              borderBottomWidth: 1,
              paddingTop: 3
            }}
          />
        </View>

        <View style={{ padding: 5 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start",
              position: "relative"
            }}
          >
            <LocationIcon />
            <Field name="location" component={EventGooglePlaces} />
          </View>
          <View
            style={{
              borderBottomColor:
                touched["location"] && errors["location"] ? "red" : "#bcbcbc",
              borderBottomWidth: 1,
              paddingTop: 3
            }}
          />
        </View>
        <View style={{ padding: 5, flexDirection: "row", marginTop: -15 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              flexWrap: "nowrap",
              position: "relative",
            }}
          >
            <CalendarIcon />
            <Text
              style={{
                fontFamily: "Lato",
                fontWeight: "400",
                marginLeft: 8,
              }}
            >
              Begin
            </Text>
          </View>
          <View style={{ flex: 2, paddingLeft: 5 }}>
            <Field
              name="startDate"
              component={CustomDatePicker}
              mode="date"
              placeholder="Date"
              format="YYYY-MM-DD"
              minDate="2016-05-01"
              maxDate="2050-06-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              customStyles={{
                dateInput: { borderWidth: 0, alignItems: "flex-start" }
              }}
              style={{ width: 200 }}
            />
            <View
              style={{
                borderBottomColor:
                  touched["startDate"] && errors["startDate"]
                    ? "red"
                    : "#bcbcbc",
                borderBottomWidth: 1,
                width: 100
              }}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Field
              name="startTime"
              component={CustomDatePicker}
              mode="time"
              placeholder="Time"
              format="hh:mm A"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              customStyles={{
                dateInput: { borderWidth: 0, alignItems: "flex-start" }
              }}
              style={{ width: 200 }}
            />
            <View
              style={{
                borderBottomColor:
                  touched["startTime"] && errors["startTime"]
                    ? "red"
                    : "#bcbcbc",
                borderBottomWidth: 1,
                width: 100
              }}
            />
          </View>
        </View>

        <View style={{ padding: 5, flexDirection: "row" }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text
              style={{
                marginLeft: 8,
                marginRight: 14,
                textAlign: "right"
              }}
            >
              End
            </Text>
          </View>
          <View style={{ flex: 2, paddingLeft: 5 }}>
            <Field
              name="endDate"
              component={CustomDatePicker}
              mode="date"
              placeholder="Date"
              format="YYYY-MM-DD"
              minDate="2016-05-01"
              maxDate="2050-06-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              customStyles={{
                dateInput: { borderWidth: 0, alignItems: "flex-start" }
              }}
              style={{ width: 200 }}
            />
            <View
              style={{
                borderBottomColor:
                  touched["endDate"] && errors["endDate"] ? "red" : "#bcbcbc",
                borderBottomWidth: 1,
                width: 100
              }}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Field
              name="endTime"
              component={CustomDatePicker}
              mode="time"
              placeholder="Time"
              format="hh:mm A"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              customStyles={{
                dateInput: { borderWidth: 0, alignItems: "flex-start" }
              }}
              style={{ width: 200 }}
            />
            <View
              style={{
                borderBottomColor:
                  touched["endTime"] && errors["endTime"] ? "red" : "#bcbcbc",
                borderBottomWidth: 1,
                width: 100
              }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            paddingTop: 15
          }}
        >
          <View style={{ flex: 2 }}>
            <ListItem
              noIndent
              style={
                Platform.OS === "ios"
                  ? AddOrCreateEventStyles.checkbox_ios
                  : AddOrCreateEventStyles.checkbox_android
              }
            >
              <Field
                name="privateValue"
                component={CustomCheckBox}
                value={values["privateValue"]}
              />

              <Body style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontWeight: "400",
                    fontSize: 18,
                    color: "#004D9B"
                  }}
                >
                  This event is
                  {values["privateValue"] ? " private" : " public"}
                </Text>
              </Body>
            </ListItem>
          </View>
        </View>
      </View>
      {Platform.OS === "ios" ? (
        <Footer style={AddOrCreateEventStyles.bottomView_ios}>
          <Left>
            {isEditMode ? (
              <View>
                <EventCancel id={eventId} isEditMode={isEditMode} />
                <EventOverview id={eventId} isEditMode={isEditMode} />
              </View>
            ) : (
              <EventCancel id={eventId} isEditMode={isEditMode} />
            )}
          </Left>
          <Body />
          <Right>
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={AddOrCreateEventStyles.fabRightWrapperStyles}
            >
              {Platform.OS === "ios" ? (
                <Image
                  source={IconsMap.icon_next}
                  style={AddOrCreateEventStyles.fabStyles}
                />
              ) : (
                <Image
                  source={{ uri: AddEventSvg.btn_Next }}
                  style={AddOrCreateEventStyles.fabStyles}
                />
              )}
            </TouchableOpacity>
          </Right>
        </Footer>
      ) : (
        <View style={AddOrCreateEventStyles.bottomView_android}>
          <Left>
            {isEditMode ? (
              <View>
                <EventCancel id={eventId} isEditMode={isEditMode} />
                <EventOverview id={eventId} isEditMode={isEditMode} />
              </View>
            ) : (
              <EventCancel id={eventId} isEditMode={isEditMode} />
            )}
          </Left>
          <Body />
          <Right>
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={AddOrCreateEventStyles.fabRightWrapperStyles}
            >
              {Platform.OS === "ios" ? (
                <Image
                  source={IconsMap.icon_next}
                  style={AddOrCreateEventStyles.fabStyles}
                />
              ) : (
                <Image
                  source={{ uri: AddEventSvg.btn_Next }}
                  style={AddOrCreateEventStyles.fabStyles}
                />
              )}
            </TouchableOpacity>
          </Right>
        </View>
      )}
    </React.Fragment>
  );
};

export default AddEventForm;
