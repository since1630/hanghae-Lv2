const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comments");
const authMiddleware = require("../middlewares/auth-middleware.js");
const Posts = require("../schemas/posts");
const User = require("../schemas/user");

//? 댓글 조회
router.get("/:_postId/comments", async (req, res) => {
  // const { _id: userId } = res.locals.user;
  try {
    const comments = await Comments.find({}).sort({ updatedAt: -1 });
    //! 댓글을 작성할 게시글이 존재하지 않는 경우
    if (!comments) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    const new_comments = comments.map((comment) => {
      return {
        commentId: comment["_id"], //* comment의 기본키(_id)를 CommentId에 담기 위한 작업
        userId: comment["user"],
        nickname: comment["nickname"],
        content: comment["content"],
        createdAt: comment["createdAt"],
        updatedAt: comment["updatedAt"],
      };
    });

    return res.status(200).json({ comments: new_comments });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

//? 댓글 생성
router.post("/:_postId/comments", authMiddleware, async (req, res) => {
  const { _id: userId, nickname } = res.locals.user;
  const { _postId } = req.params;
  const { comment } = req.body; // POST로 넘어온다. body 객체 참조할 것.
  try {
    //! 412 body 데이터가 정상적으로 전달되지 않는 경우
    if (Object.keys(comment).length < 1)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });

    //! 댓글 내용을 안적은 경우
    if (!comment)
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });

    //! 404 댓글을 작성할 게시글이 존재하지 않는 경우
    const posts = await Posts.findById({ _postId });
    if (!posts)
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });

    await Comments.create({
      userId,
      nickname,
      comment,
    });
    return res.status(200).json({ message: "댓글을 작성하였습니다" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
});

//? 댓글 수정
router.put(
  "/:_postId/comments/:_commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { _id: userId } = res.locals.user;
      const { _commentId } = req.params;
      const { comment } = req.body;

      //! 404 댓글을 작성할 게시글이 존재하지 않는 경우
      const posts = await Posts.findById({ _postId });
      if (!posts)
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });

      //! 403 게시글을 수정할 권한이 존재하지 않는 경우
      if (userId !== posts.userId) {
        // 현재 로그인된 유저의 아이디와 게시글의 아이디가 불일치 할 경우 수정 권한 없음
        return res
          .status(403)
          .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
      }

      //! 412 body 데이터가 정상적으로 전달되지 않는 경우
      if (Object.keys(comment).length < 1)
        return res
          .status(400)
          .json({ message: "데이터 형식이 올바르지 않습니다" });

      // comment param에 해당하는 데이터가 존재하는지 체크
      const comments = await Comments.find({ _id: _commentId });

      //! 404 댓글이 존재하지 않는 경우
      if (comments.length === 0) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      await Comments.updateOne({ _id: _commentId }, { $set: { comment } });

      //! 400 댓글 수정에 실패한 경우
      if (comment !== comments.comment) {
        return res.status(400).json({
          errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다.",
        });
      }
      return res.status(204).json({ message: "댓글을 수정하였습니다" }); // 상태코드 수정 201 -> 204
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
  }
);

//? 댓글 삭제
router.delete(
  "/:_postId/comments/:_commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { _id: userId } = res.locals.user;
      const { _commentId } = req.params;

      //! 404 댓글을 작성할 게시글이 존재하지 않는 경우
      const posts = await Posts.findById({ _postId });
      if (!posts)
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });

      //! 403 게시글을 수정할 권한이 존재하지 않는 경우
      if (userId !== posts.userId) {
        // 현재 로그인된 유저의 아이디와 게시글의 아이디가 불일치 할 경우 수정 권한 없음
        return res
          .status(403)
          .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
      }

      const comments = await Comments.find({ _id: _commentId });

      //! 404 댓글이 존재하지 않는 경우
      if (comments.length === 0) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      await Comments.deleteOne({ _id: _commentId });

      const checkCommentDelete = await Comments.findOne({ _id: _commentId });

      //! 400 댓글 삭제에 실패한 경우
      if (checkCommentDelete) {
        return res.status(400).json({
          errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다.",
        });
      }
      return res.status(204).json({ message: "댓글을 삭제하였습니다" });
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  }
);

module.exports = router;
