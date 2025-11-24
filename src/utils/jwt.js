const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const JWT_SECRET = process.env.JWT_SECRET 
const ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY

const encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
};

const decryptToken = (encryptedToken) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const generateToken = (payload, expiresIn = '7d') => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return encryptToken(token);
};

const verifyToken = (encryptedToken) => {
  try {
    const token = decryptToken(encryptedToken);
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  encryptToken,
  decryptToken
};
