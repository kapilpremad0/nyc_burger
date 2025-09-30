const User = require('../models/User'); // adjust path as needed

/**
 * Middleware to authorize user by module + action
 * @param {string} module - module name e.g. 'category', 'product', 'order'
 * @param {string} action - action name e.g. 'create', 'update', 'delete', 'show'
 */
module.exports = function(module, action) {
  return async (req, res, next) => {  // <-- make async
    try {
      const userID = req.session.admin?.id;  // get admin id from session

      if (!userID) return res.status(401).json({ error: "Unauthorized" });

      // fetch user from DB
      const user = await User.findById(userID);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // Admin bypass: full access
      if (user.user_type === "admin") return next();

      // Check if staff has permission for this module + action
      const userPermissions = user.permissions || {};

      if (
        !userPermissions[module] || 
        !Array.isArray(userPermissions[module]) || 
        !userPermissions[module].includes(action)
      ) {
        return res.status(403).json({ error: "Forbidden: No permission" });
      }

      next();

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  };
};
