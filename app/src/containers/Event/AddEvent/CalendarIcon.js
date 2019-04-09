import React from "react";
import { Platform } from "react-native";
import Image from "react-native-remote-svg";

const CalendarIcon = () => {
  return (
    <React.Fragment>
      {Platform.OS === "ios" ? (
        <Image
          source={IconsMap.icon_calendar}
          style={{
            width: 20,
            height: 20,
            position: "absolute",
            left: -10,
            top: 2
          }}
        />
      ) : (
        <Image
          source={{
            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                      <defs>
                        <style>
                          .cls-1 {
                            fill: none;
                          }
                    
                          .cls-2 {
                            fill: #2699fb;
                            fill-rule: evenodd;
                          }
                        </style>
                      </defs>
                      <g id="Calendar" transform="translate(-24 -242)">
                        <rect id="Rectangle_557" data-name="Rectangle 557" class="cls-1" width="16" height="16" transform="translate(24 242)"/>
                        <path id="Path_149" data-name="Path 149" class="cls-2" d="M2,5v9H14V5ZM13,2h2a.945.945,0,0,1,1,1V15a.945.945,0,0,1-1,1H1a.945.945,0,0,1-1-1V3A.945.945,0,0,1,1,2H3V1A.945.945,0,0,1,4,0,.945.945,0,0,1,5,1V2h6V1a1,1,0,0,1,2,0ZM12,12H10V10h2ZM9,12H7V10H9Zm3-3H10V7h2ZM9,9H7V7H9ZM6,12H4V10H6Z" transform="translate(24 242)"/>
                      </g>
                    </svg>
                    `
          }}
          style={{
            width: 30,
            height: 30,
            position: "absolute",
            left: 0,
            top: 2
          }}
        />
      )}
    </React.Fragment>
  );
};

export default CalendarIcon;
