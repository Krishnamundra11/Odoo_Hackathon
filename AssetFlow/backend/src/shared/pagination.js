/**
 * Pagination helper.
 * Normalises page/limit from query params and returns offset + sanitised values.
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 20;
  if (limit > 100) limit = 100; // hard cap

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = { parsePagination };
