/**
 * Role-based authorization middleware.
 * Usage:  router.get("/admin-only", requireRole("admin"), handler)
 *         router.post("/doctor-or-admin", requireRole("admin", "doctor"), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated", success: false });
    }
    const userRole = (req.user.role || "").toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
        success: false,
      });
    }
    next();
  };
};

module.exports = { requireRole };
