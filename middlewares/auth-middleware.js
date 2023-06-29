const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

module.exports = async (req, res, next) => {
  // // //! body 데이터가 정상적으로 전달되지 않은 경우
  // if (req.headers["content-type"] !== "application/json") {
  //   return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  // }
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");
  // Cookie 가 존재하지 않을 경우
  if (!authToken) {
    return res
      .status(403)
      .json({ errorMessage: "로그인이 필요한 기능입니다." });
  }
  // 비정상적인 쿠키
  if (authType !== "Bearer") {
    return res
      .status(403)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
  }
  try {
    const { nickname } = jwt.verify(authToken, "secret-key");

    const user = await User.findOne({ nickname });
    if (!user) {
      return res
        .status(412)
        .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }
    res.locals.user = user; // 찾은 아이디를 locals 프로퍼티에 담는다. 메모리 효율 Up
    next(); // 다음 미들웨어로 이동
  } catch (err) {
    console.error(err);
    return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
  }
};
