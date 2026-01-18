import { EventService } from "../services/event.service.js";

export class NotificationController {
    constructor() {
        this.eventService = new EventService();
    }

    getNotifications = async (req, res) => {
        try {
            const user = req.user;
            console.log("Fetching notifications for user: ", user);
            const notifications = await this.eventService.getNotificationByUserId(user.id);
            res.status(200).json({ notifications });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
        }
    }

    updateNotifications = async (req, res) => {
        try {
            const { eventIds } = req.body;
            if (!Array.isArray(eventIds) || eventIds.length === 0) {
                return res.status(400).json({ message: 'eventIds should be a non-empty array' });
            }
            const updatedEvents = await this.eventService.markAsRead(eventIds);
            res.status(200).json({ updatedEvents });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to update notifications', message: error.message });
        }
    }

    getNotificationCount = async (req, res) => {
        try {
            const user = req.user;
            const count = await this.eventService.getUnreadNotificationCount(user.id);
            res.status(200).json({ unreadCount: count });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch notification count', message: error.message });
        }
    }


    getUnreadNotificationCount = async (req, res) => {
        try {
            const user = req.user;
            const count = await this.eventService.getUnreadNotificationCount(user.id);
            console.log("Unread notification count for user ", user.id, ": ", count);
            res.status(200).json({ unreadCount: count });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch unread notification count', message: error.message });
        }
    }
}