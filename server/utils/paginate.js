function getPagination(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // ✅ default 20
  const safeLimit = Math.min(limit, 100); // ✅ max 100
  const offset = (page - 1) * safeLimit;

  return { page, limit: safeLimit, offset };
}

module.exports = {getPagination};
