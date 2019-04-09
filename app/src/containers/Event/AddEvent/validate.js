import _ from "lodash";

export const validate = values => {
  let errors = {};

  if (!values.eventTitle) {
    errors.eventTitle = "Required";
  }

  if (!values.eventType) {
    errors.eventType = "Required";
  }

  if (!values.eventLocation) {
    errors.eventLocation = "Required";
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

  return errors;
};
