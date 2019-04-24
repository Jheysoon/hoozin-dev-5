import _ from "lodash";
import React from "react";
import { Icon, Button } from "native-base";

const EventAddInviteeItem = ({ data, addToEvent, removeToEvent }) => {
  return (
    <React.Fragment>
      {data.preselect ? (
        <Button
          transparent
          icon
          disabled={
            _.has(data, "status") &&
            (data.status == "going" || data.status == "maybe")
              ? true
              : false
          }
          style={{ alignSelf: "center" }}
          onPress={() => removeToEvent(data)}
        >
          {minusIcon(data)}
        </Button>
      ) : (
        <Button
          transparent
          icon
          style={{ alignSelf: "center" }}
          onPress={() => addToEvent(data)}
        >
          <Icon type="FontAwesome" name="plus" style={{ color: "#6EB25A" }} />
        </Button>
      )}
    </React.Fragment>
  );
};

const minusIcon = data => {
  if (
    _.has(data, "status") &&
    (data.status == "going" || data.status == "maybe")
  ) {
    return null;
  }

  return <Icon type="FontAwesome" name="minus" style={{ color: "#FC3764" }} />;
};

export default EventAddInviteeItem;
