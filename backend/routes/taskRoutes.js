import express from "express"
import { createTask, getGroupTasks, updateTask, deleteTask, getTaskProgress } from "../controllers/taskController.js"
import { protect } from "../middleware/authMiddleware.js"
import validateObjectIds from "../middleware/validateObjectIds.js"

const router = express.Router({ mergeParams: true })

router.route("/").post(protect, createTask).get(protect, getGroupTasks)
router.route("/progress").get(protect, getTaskProgress);
router.route("/:taskId").put(protect, validateObjectIds('taskId'), updateTask).delete(protect, validateObjectIds('taskId'), deleteTask)

export default router
