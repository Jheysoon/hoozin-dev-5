import React from "react";
import { Field } from "formik";

import LocationIcon from "./LocationIcon";
import CalendarIcon from "./CalendarIcon";
import { AddOrCreateEventStyles } from "./addevent.style";
import CustomTextInput from "../../../formik/CustomTextInput";
import CustomDatePicker from "../../../formik/CustomDatePicker";
import EventGooglePlaces from "../../../formik/EventGooglePlaces";
import CustomCheckBox from "./../../../formik/CustomCheckBox";
import { View, Text, Platform } from "react-native";
import { Body, ListItem } from "native-base";

const AddEventForm = ({ form }) => {
  console.log("AddEventForm form here############");
  console.log(form);

  return (
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
              form.touched["eventTitle"] && form.errors["eventTitle"]
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
              form.touched["eventType"] && form.errors["eventType"]
                ? "red"
                : "#bcbcbc",
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
              form.touched["location"] && form.errors["location"]
                ? "red"
                : "#bcbcbc",
            borderBottomWidth: 1,
            paddingTop: 3
          }}
        />
      </View>
      <View style={{ padding: 5, flexDirection: "row" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            flexWrap: "nowrap",
            position: "relative"
          }}
        >
          <CalendarIcon />
          <Text
            style={{
              fontFamily: "Lato",
              fontWeight: "400",
              marginLeft: 8
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
                form.touched["startDate"] && form.errors["startDate"]
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
                form.touched["startTime"] && form.errors["startTime"]
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
                form.touched["endDate"] && form.errors["endDate"]
                  ? "red"
                  : "#bcbcbc",
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
                form.touched["endTime"] && form.errors["endTime"]
                  ? "red"
                  : "#bcbcbc",
              borderBottomWidth: 1,
              width: 100
            }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingTop: 15,
          marginBottom: 50
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
              value={form.values["privateValue"]}
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
                {form.values["privateValue"] ? " private" : " public"}
              </Text>
            </Body>
          </ListItem>
        </View>
      </View>
    </View>
  );
};

export default AddEventForm;
