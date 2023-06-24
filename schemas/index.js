const mongoose = require("mongoose");

const connect = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/Lv1")
    .catch((err) => console.error(err));
};
// const connect_comments = async () => {
//   await mongoose
//     .connect("http://localhost:27017/Lv1")
//     .catch((err) => console.error(err));
// };

mongoose.connection.on("error", (err) =>
  console.error("몽고 디비 연결 에러", err)
);

module.exports = connect;
