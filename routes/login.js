const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

router.post("/", async (req, res) => {
  try {
    const { nickname, password } = req.body;
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ errorMessage: "입력값이 존재하지 않습니다" });
    }
    const user = await User.findOne({ nickname, password });
    if (!user) {
      return res
        .status(412)
        .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }
    const token = jwt.sign({ nickname }, "secret-key");
    res.cookie("Authorization", `Bearer ${token}`);
    return res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
  }
});

module.exports = router;
