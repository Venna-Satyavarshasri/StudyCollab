// backend/routes/calendarRoutes.js
import express from "express"
import { createCalendarEvent, getGroupCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from "../controllers/calendarController.js"
import {protect} from "../middleware/authMiddleware.js"
import validateObjectIds from "../middleware/validateObjectIds.js"

const router = express.Router({mergeParams: true})

router.route("/").post(protect, createCalendarEvent).get(protect, getGroupCalendarEvents)
router.route("/:eventId").put(protect, validateObjectIds('eventId'), updateCalendarEvent).delete(protect, validateObjectIds('eventId'), deleteCalendarEvent)

export default router