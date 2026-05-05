const { sendError } = require('../../common/utils/http-error');
const { validatePublicationIdParam } = require('./likes.validators');
const {
  addLikeToPublication,
  removeLikeFromPublication
} = require('./likes.service');

// Controller de POST /publicacions/:id/likes
async function createLike(req, res) {
  try {
    const publicationId = validatePublicationIdParam(req.params);
    const result = await addLikeToPublication(publicationId, req.auth);

    return res.status(200).json({
      ok: true,
      message: 'Like afegit correctament',
      publicationId: result.publicationId,
      likedByMe: result.likedByMe,
      likesCount: result.likesCount
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Controller de DELETE /publicacions/:id/likes
async function deleteLike(req, res) {
  try {
    const publicationId = validatePublicationIdParam(req.params);
    const result = await removeLikeFromPublication(publicationId, req.auth);

    return res.status(200).json({
      ok: true,
      message: 'Like eliminat correctament',
      publicationId: result.publicationId,
      likedByMe: result.likedByMe,
      likesCount: result.likesCount
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  createLike,
  deleteLike
};
