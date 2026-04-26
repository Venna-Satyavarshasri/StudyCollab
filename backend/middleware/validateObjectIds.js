import mongoose from "mongoose";

/**
 * Validates that all named route params are valid MongoDB ObjectIds.
 * Usage: router.get("/:groupId/tasks", validateObjectIds("groupId"), protect, getGroupTasks)
 */
const validateObjectIds = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    const id = req.params[param];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      return next(new Error(`Invalid ID format for parameter: ${param}`));
    }
  }
  next();
};

export default validateObjectIds;
