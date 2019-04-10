import _ from "lodash";
import moment from "moment";
import { Alert } from "react-native";

export const validate = values => {
  let errors = {};

  if (!values.eventTitle) {
    errors.eventTitle = "Required";
  }

  if (!values.eventType) {
    errors.eventType = "Required";
  }

  if (!values.location) {
    errors.location = "Required";
  }

  if (!values.startDate) {
    errors.startDate = "Required";
  }

  if (!values.startTime) {
    errors.startTime = "Required";
  }

  if (!values.endDate) {
    errors.endDate = "Required";
  }

  if (!values.endTime) {
    errors.endTime = "Required";
  }

  if (!values.location) {
    errors.location = "Required";
  }

  if (
    values.startDate &&
    values.startTime &&
    values.endDate &&
    values.endTime
  ) {
    const startDateTimeInUTC = moment.utc(
      moment(`${values.startDate} ${values.startTime}`, "YYYY-MM-DD hh:mm A")
    );
    const endDateTimeInUTC = moment.utc(
      moment(`${values.endDate} ${values.endTime}`, "YYYY-MM-DD hh:mm A")
    );
    const currentDateTimeInUTC = moment.utc();

    const isSameDateTime = startDateTimeInUTC.isSame(endDateTimeInUTC);
    const isValidFutureDateTime =
      endDateTimeInUTC.isAfter(startDateTimeInUTC) &&
      endDateTimeInUTC.isAfter(currentDateTimeInUTC);

    if (isValidFutureDateTime) {
      //return true;
    } else if (isSameDateTime) {
      Alert.alert(
        "Oops! wrong date time",
        "An event cannot start and end exactly at the same time!",
        [{ text: "GOT IT", style: "default" }]
      );

      errors.startTime = "An event cannot start and end exactly at the same time!";
      errors.endTime = "An event cannot start and end exactly at the same time!";

    } else if (!isValidFutureDateTime) {
      Alert.alert(
        "Oops! wrong date time",
        "Event cannot start or end past from today and it should end after its starting date time",
        [{ text: "GOT IT", style: "default" }]
      );

      errors.startDate = "Event cannot start or end past from today and it should end after its starting date time";
      errors.startTime = "Event cannot start or end past from today and it should end after its starting date time";
      errors.endDate = "Event cannot start or end past from today and it should end after its starting date time";
      errors.endTime = "Event cannot start or end past from today and it should end after its starting date time";
    }
  }

  return errors;
};
