import Prisma from "../config/prismaClient.js";

export class EventService {
    async createEvent(userId, eventType, eventData) {
        if(!eventType.match(/^(notification|activity)$/i)){
            throw new Error('Invalid event type');
        }

        try {
            const data = {
                ...eventData,
                userId,
                eventType
            }
            const newEvent = await Prisma.event.create({data});
            return newEvent;
        } catch (error) {
            console.log(error);
            throw new Error('Error creating event in the database');
        }
    }

    async getNotificationByUserId(userId) {
        try {
            const events = await Prisma.event.findMany({
                where: { userId , eventType: 'notification' },
                orderBy: { createdAt: 'desc' }
            });
            return events;
        } catch (error) {
            throw new Error('Error fetching events from the database');
        }
    }

    async getActivityByUserId(userId) {
        try {
            const events = await Prisma.event.findMany({
                where: { userId , eventType: 'activity' },
                orderBy: { createdAt: 'desc' }
            });
            return events;
        } catch (error) {
            throw new Error('Error fetching events from the database');
        }
    }

    async markAsRead(eventIds) {
        if(!Array.isArray(eventIds) || eventIds.length === 0){
            throw new Error('eventIds should be a non-empty array');
        }
        try {
            const updatedEvent = await Prisma.event.updateMany({
                where: { id : { in: eventIds } },
                data: { isRead: true }
            });
            return updatedEvent;
        } catch (error) {
            throw new Error('Error updating event in the database');
        }
    }

    async getUnreadNotificationCount(userId) {
        try {
            const count = await Prisma.event.count({
                where: { userId , eventType: 'notification' , isRead: false }
            });
            return count;
        } catch (error) {
            throw new Error('Error fetching unread notification count from the database');
        }
    }
}