const { sendError } = require('../../common/utils/http-error');
const {
  validatePublicationIdParam,
  validateCommentIdParam,
  validateCreateCommentBody
} = require('./comments.validators');
const {
  listCommentsByPublicationId,
  createCommentOnPublication,
  deleteCommentById
} = require('./comments.service');

// Controller de GET /publicacions/:id/comments
async function getPublicationComments(req, res) {
  try {
    const publicationId = validatePublicationIdParam(req.params);
    const comments = await listCommentsByPublicationId(publicationId);

    return res.status(200).json({
      ok: true,
      message: 'Comentaris recuperats correctament',
      count: comments.length,
      comments
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Controller de POST /publicacions/:id/comments
async function createComment(req, res) {
  try {
    const publicationId = validatePublicationIdParam(req.params);
    const payload = validateCreateCommentBody(req.body);

    const result = await createCommentOnPublication(publicationId, req.auth, payload);

    return res.status(201).json({
      ok: true,
      message: 'Comentari creat correctament',
      comment: result.comment,
      commentsCount: result.commentsCount
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Controller de DELETE /comments/:id
async function deleteComment(req, res) {
  try {
    const commentId = validateCommentIdParam(req.params);
    const result = await deleteCommentById(commentId, req.auth);

    return res.status(200).json({
      ok: true,
      message: 'Comentari eliminat correctament',
      commentId: result.commentId,
      publicationId: result.publicationId,
      commentsCount: result.commentsCount
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  getPublicationComments,
  createComment,
  deleteComment
};
