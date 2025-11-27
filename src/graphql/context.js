const { verifyToken } = require('../utils/jwt');

const getGraphQLContext = (req) => {
  const context = {};

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const encryptedToken = authHeader.substring(7);
      const decoded = verifyToken(encryptedToken);

      context.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    }
  } catch (error) {
    context.user = null;
  }

  return context;
};

module.exports = { getGraphQLContext };
