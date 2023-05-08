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
