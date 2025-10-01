const crypto = require('crypto');

const generateSecretKey = async (length = 32) => {
  return crypto.randomBytes(length).toString('hex'); // 64-character hex string for length=32
};

module.exports = {
  generateSecretKey,
};
