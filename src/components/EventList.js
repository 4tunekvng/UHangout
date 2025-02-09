import React from "react";
import Event from "./Event";
import Box from "@mui/material/Box";

const EventList = ({ events, userList, user }) => {
  const userId = user ? user.uid : "";

  return (
    <Box sx={{ mx: "auto", width: 300 }}>
      {events.map((event) => {
        return (
          !Object.values(event.people).includes(userId) && (
            <Event
              key={event.id}
              event={event}
              userList={userList}
              user={userId}
            />
          )
        );
      })}
    </Box>
  );
};

export default EventList;
