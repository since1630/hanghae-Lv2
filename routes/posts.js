const express = require("express");
const router = express.Router();
const Posts = require("../schemas/posts");

//게시글 전체 조회
router.get("/", async (req, res) => {
  const data = await Posts.find({}).sort({ createdAt: -1 });
  const new_data = data.map((post) => {
    return {
      postId: post["_id"],
      user: post["user"],
      title: post["title"],
      created_at: post["createdAt"],
    };
  });

  res.status(200).json({ data: new_data });
});

// 게시글 상세 조회
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const data = await Posts.find({ _id: _postId });
    const new_data = data.map((post) => {
      return {
        postId: post["_id"],
        user: post["user"],
        title: post["title"],
        created_at: post["createdAt"],
      };
    });
    if (
      Object.keys(req.params).length === 0 ||
      Object.keys(req.body).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    res.status(200).json({ data: new_data });
  } catch (err) {
    console.error(console.error(err));
  }
});

// 게시글 작성
router.post("/", async (req, res) => {
  try {
    const { user, password, title, content } = req.body; // POST로 넘어온다. body 객체 참조할 것.
    await Posts.create({ user, password, title, content });
    if (!req.params || !req.body) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    return res.status(200).json({ message: "게시글을 생성하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

// 게시글 수정
router.put("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password, title, content } = req.body;
    const data = await Posts.find({ _id: _postId });
    console.log(data);
    const db_password = data.password;
    if (data && db_password === password) {
      await Posts.updateOne(
        { _id: _postId },
        { $set: { password, title, content } }
      );
      return res.status(200).json({ message: "게시글을 수정하였습니다" });
    } else if (!data.length) {
      return res.status(400).json({ message: "게시글 조회에 실패하였습니다." });
    } else {
      return res.status(400).json({ message: "게시글을 수정할 수 없습니다" });
    }
  } catch (err) {
    console.error({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

// 게시글 삭제
router.delete("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password } = req.body;

    const { db_password = password } = await Posts.find({ _postId });
    // const db_password = data.password;
    if (data && password === db_password) await Posts.delete({ _postId });
    else if (!data.length)
      return res.status(400).json({ message: "게시글 조회에 실패하였습니다." });
    return res.status(200).json({ message: "게시글을 삭제하였습니다" });
  } catch (err) {
    console.error({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;
