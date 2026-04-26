// backend/controllers/calendarController.js
import asyncHandler from "express-async-handler"
import CalendarEvent from "../models/CalendarEvent.js"
import Group from "../models/Group.js"
import Notification from "../models/Notification.js";
import createNotification from "../utils/createNotification.js";

const createCalendarEvent = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const {title, description, start, end} = req.body
    const senderId = req.user._id;

    if(!title || !start || !end){
        res.status(400)
        throw new Error("Event title, start, and end dates are required")
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400);
        throw new Error("Invalid date format for start or end");
    }
    if (endDate <= startDate) {
        res.status(400);
        throw new Error("End date must be after start date");
    }

    const newEvent = await CalendarEvent.create({
        group: groupId,
        title,
        description,
        start,
        end
    })

    req.io.to(groupId).emit("event:created", newEvent)

    const group = await Group.findById(groupId);
    if(group) {
        // FIX: Pass req.io to the createNotification function
        await createNotification(req.io, groupId, senderId, `${req.user.name} created a new event: "${title}" in ${group.name}`, `/groups/${groupId}?tab=calendar`);
    }

    res.status(201).json({
        message: "Event created successfully",
        event: newEvent
    })
})

const getGroupCalendarEvents = asyncHandler(async (req, res) => {
    const {groupId} = req.params
    const events = await CalendarEvent.find({group: groupId})
    res.status(200).json(events)
})

const updateCalendarEvent = asyncHandler(async (req, res) => {
    const { eventId, groupId } = req.params;
    const { title, description, start, end } = req.body;
    const senderId = req.user._id;

    const event = await CalendarEvent.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error("Event not found");
    }

    const group = await Group.findById(event.group);
    const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
    
    if (!isMember) {
        res.status(403);
        throw new Error("User not authorized to update this event");
    }
    
    event.title = title || event.title;
    event.description = description || event.description;
    event.start = start || event.start;
    event.end = end || event.end;

    const updatedEvent = await event.save();

    req.io.to(event.group.toString()).emit("event:updated", updatedEvent);

    if(group) {
        // FIX: Pass req.io to the createNotification function
        await createNotification(req.io, groupId, senderId, `${req.user.name} updated the event "${title}" in ${group.name}`, `/groups/${groupId}?tab=calendar`);
    }

    res.status(200).json(updatedEvent);
});

const deleteCalendarEvent = asyncHandler(async (req, res) => {
    const { eventId, groupId } = req.params;
    const senderId = req.user._id;

    const event = await CalendarEvent.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error("Event not found");
    }

    const group = await Group.findById(event.group);
    const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());

    if (!isMember) {
        res.status(403);
        throw new Error("User not authorized to delete this event");
    }

    const title = event.title;
    await CalendarEvent.deleteOne({ _id: eventId });

    req.io.to(event.group.toString()).emit("event:deleted", eventId);

    if(group) {
        // FIX: Pass req.io to the createNotification function
        await createNotification(req.io, groupId, senderId, `${req.user.name} deleted the event "${title}" from ${group.name}`, `/groups/${groupId}?tab=calendar`);
    }

    res.status(200).json({ message: "Event removed" });
});

export {
    createCalendarEvent,
    getGroupCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
};

