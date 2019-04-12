import moment from "moment";
import React from "react";
import DatePicker from "react-native-datepicker";

class CustomDatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.setFieldValue = this.setFieldValue.bind(this);
  }

  setFieldValue(date) {
    const { field, form } = this.props;

    if (field.name == "startTime" && form.values["startDate"] != "") {
      let p = form.values["startDate"] + " " + date;

      let m = moment(p, "YYYY-MM-DD h:mm A").valueOf();
      let hour = moment(p, "YYYY-MM-DD h:mm A").format("h");
      let amPm = moment(p, "YYYY-MM-DD h:mm A").format("A");
      let ampm = amPm;
      let endTime = moment(m).add(1, "h");
      let endDate = moment(p, "YYYY-MM-DD");

      if ((hour == 12 || endTime.format("h") == 12) && amPm == "AM") {
        ampm = "PM";
      } else if ((hour == 12 || endTime.format("h") == 12) && amPm == "PM") {
        ampm = "AM";
        endDate = endDate.add(1, "d");
      }

      form.setValues({
        ...form.values,
        startTime: date,
        endTime: endTime.format("hh:mm") + ampm,
        endDate: endDate.format("YYYY-MM-DD")
      });
    } else {
      form.setFieldValue(field.name, date);
    }
  }

  render() {
    const { field } = this.props;
    return (
      <DatePicker
        date={field.value}
        onDateChange={this.setFieldValue}
        {...this.props}
      />
    );
  }
}

export default CustomDatePicker;
