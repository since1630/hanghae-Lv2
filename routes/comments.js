const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comments");

//? 댓글 조회
router.get("/:_postId/comments", async (req, res) => {
  const comments = await Comments.find({});
  let new_comments = comments.map((comment) => {
    return {
      commentId: comment["_id"], //* comment의 기본키(_id)를 CommentId에 담기 위한 작업
      user: comment["user"],
      content: comment["content"],
      createdAt: comment["createdAt"],
    };
  });
  res.status(200).json({ data: new_comments });
});

//? 댓글 생성
router.post("/:_postId/comments", async (req, res) => {
  try {
    const { _postId } = req.params;
    if (!_postId || !req)
      return res.json({ message: "데이터 형식이 올바르지 않습니다" });
    const { user, password, content } = req.body; // POST로 넘어온다. body 객체 참조할 것.

    if (!content) return res.json({ message: "댓글 내용을 입력해주세요" });

    await Comments.create({ _postId, user, password, content });
    return res.status(200).json({ message: "댓글을 생성하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

//? 댓글 수정
router.put("/:_postId/comments/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password, content } = req.body;
    if (
      Object.keys(req.body).length === 0 ||
      Object.keys(req.params).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    } else if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });
    } else if (!_commentId) {
      return res
        .status(404)
        .json({ message: "{ message: '댓글 조회에 실패하였습니다. }" });
    }
    await Comments.updateOne(
      { _id: _commentId },
      { $set: { password, content } }
    );
    res.status(200).json({ message: "댓글을 수정하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

//? 댓글 삭제
router.delete("/:_postId/comments/:_commentId", async (req, res) => {
  try {
    const { password, _commentId } = req.params;
    // const { password } = req.body;
    const data = await Comments.find({ _id: _commentId });
    console.log(data);
    if (
      Object.keys(req.body).length === 0 ||
      Object.keys(req.params).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    } else if (!data.length)
      return res.status(400).json({ message: "댓글 조회에 실패했습니다" });

    await Comments.deleteOne({ _id: _commentId });
    return res.status(200).json({ message: "댓글을 삭제하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
