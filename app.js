const express = require("express");
const app = express();
const indexRouter = require("./routes/index");
const connect = require("./schemas");
connect();

app.use(express.json()); // POST body 안에 있는 데이터를 사용하기 위해 프로젝트 파일 전역에 json() 적용
app.use("/", indexRouter);

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("홈피에 오신걸 환영합니다.");
});
