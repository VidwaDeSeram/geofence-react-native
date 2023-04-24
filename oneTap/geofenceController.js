const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDU3ZDQ5NzhjZjM4NzBiYzJmMDY5ZSIsImlhdCI6MTY4MjM0MTk0OSwiZXhwIjoxNjg0OTMzOTQ5fQ.WnI0yRndMtLSTBxAl_DZ5RJBXSsZHz8cwiIiY8wWgJ0";

let lectureDetailsArray;

exports.lectureDetailsByUserID = async () => {
  try {
    const response = await fetch(
      `http://192.168.8.132:3000/api/time/lectureDetailsByUserID`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    lectureDetailsArray = await response.json();
    console.log("received");
  } catch (error) {
    console.error("Error fetching lecture details:", error);
  }
};
const getCurrentSriLankanTime = () => {
  const timeZone = "Asia/Colombo";
  const options = {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };
};
makeHTTPRequest = async (lectureID) => {
  try {
    const response = await fetch(`http://localhost:3000/api/attendance/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lectureID: lectureID,
      }),
    });
    console.log("Sent111111111111111111111111111111111111111111111");
  } catch (error) {
    console.error("Error :", error);
  }
};

geofenceTimer = async (lectureDetails) => {
  const { startTime, endTime, geofenceID, duration, _id } = lectureDetails;

  let currentTime = getCurrentSriLankanTime();
  let timer = 0;
  let timerInterval;

  if (currentTime > startTime && currentTime < endTime) {
    timerInterval = setInterval(() => {
      console.log(currentGeofence);
      // Check if geofenceID equals mainGeofence.id
      if (currentGeofence && geofenceID === currentGeofence.id) {
        timer++;

        // Check if timer reached 75% of the duration and make an HTTP request
        if (timer === Math.round(duration * 0.75)) {
          makeHTTPRequest(_id);
        }
      }

      // Check if the current time passes the endTime and stop the timer
      currentTime = getCurrentSriLankanTime();
      if (currentTime >= endTime) {
        clearInterval(timerInterval);
      }
    }, 1000); // Update the timer every second (1000 ms)
  }
};
exports.processMultipleLectureDetails = async () => {
  for (const lectureDetail of lectureDetailsArray) {
    await geofenceTimer(lectureDetail);
  }
};
