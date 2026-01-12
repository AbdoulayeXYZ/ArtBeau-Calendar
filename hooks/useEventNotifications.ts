'use client';

import { useEffect, useRef } from 'react';

interface RecurringEvent {
    name: string;
    days: number[]; // 0=Sunday, 1=Monday, etc.
    startHour: number;
    startMinute: number;
    notifyMinutesBefore: number;
}

const EVENTS: RecurringEvent[] = [
    {
        name: 'Brainstorming',
        days: [1, 2, 3, 4, 5], // Mon-Fri
        startHour: 15,
        startMinute: 0,
        notifyMinutesBefore: 5
    },
    {
        name: 'Weekly',
        days: [6], // Saturday
        startHour: 11,
        startMinute: 0,
        notifyMinutesBefore: 10
    }
];

export function useEventNotifications(userAvailability: any[]) {
    const notifiedEvents = useRef<Set<string>>(new Set());
    const permissionRequested = useRef(false);

    useEffect(() => {
        // Request notification permission once
        if (!permissionRequested.current && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
            permissionRequested.current = true;
        }

        // Check every minute for upcoming events
        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            EVENTS.forEach(event => {
                // Check if today is a valid day for this event
                if (!event.days.includes(currentDay)) return;

                // Calculate notification time
                const eventTime = new Date(now);
                eventTime.setHours(event.startHour, event.startMinute, 0, 0);

                const notifyTime = new Date(eventTime);
                notifyTime.setMinutes(notifyTime.getMinutes() - event.notifyMinutesBefore);

                const notifyHour = notifyTime.getHours();
                const notifyMinute = notifyTime.getMinutes();

                // Check if it's time to notify
                if (currentHour === notifyHour && currentMinute === notifyMinute) {
                    const eventKey = `${event.name}-${now.toDateString()}`;

                    // Avoid duplicate notifications
                    if (notifiedEvents.current.has(eventKey)) return;

                    // Check if user is available at event time
                    const isAvailable = checkUserAvailability(
                        userAvailability,
                        now,
                        event.startHour,
                        event.startMinute
                    );

                    if (isAvailable) {
                        sendNotification(event);
                        notifiedEvents.current.add(eventKey);
                    }
                }
            });

            // Clean old notifications (older than today)
            const today = now.toDateString();
            const keysToDelete: string[] = [];
            notifiedEvents.current.forEach(key => {
                if (!key.endsWith(today)) {
                    keysToDelete.push(key);
                }
            });
            keysToDelete.forEach(key => notifiedEvents.current.delete(key));

        }, 60000); // Check every minute

        return () => clearInterval(checkInterval);
    }, [userAvailability]);
}

function checkUserAvailability(
    availability: any[],
    date: Date,
    eventHour: number,
    eventMinute: number
): boolean {
    if (!availability || availability.length === 0) return false;

    const dateStr = date.toISOString().split('T')[0];
    const eventTimeDecimal = eventHour + eventMinute / 60;

    // Check if user has availability marked for this time
    const hasAvailability = availability.some(avail => {
        // Check date range
        const startDate = new Date(avail.dateDebut);
        const endDate = new Date(avail.dateFin);
        const currentDate = new Date(dateStr);

        if (currentDate < startDate || currentDate > endDate) return false;

        // Check if status is disponible or moyennement
        if (avail.statut === 'indisponible') return false;

        // Check time range
        if (!avail.horaireText || !avail.horaireText.includes('-')) return false;

        try {
            const [start, end] = avail.horaireText.split('-').map((s: string) => s.trim());
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);

            const startTimeDecimal = startH + (startM || 0) / 60;
            const endTimeDecimal = endH + (endM || 0) / 60;

            return eventTimeDecimal >= startTimeDecimal && eventTimeDecimal <= endTimeDecimal;
        } catch {
            return false;
        }
    });

    return hasAvailability;
}

function sendNotification(event: RecurringEvent) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(`🔔 ${event.name} dans ${event.notifyMinutesBefore} minutes`, {
        body: `Le ${event.name} commence à ${event.startHour}h${event.startMinute.toString().padStart(2, '0')}. Préparez-vous !`,
        icon: '/iconlogo.png',
        badge: '/iconlogo.png',
        tag: event.name,
        requireInteraction: false,
        silent: false
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Optional: Focus window when clicked
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}
