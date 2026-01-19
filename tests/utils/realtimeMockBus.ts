import { vi } from 'vitest';

/**
 * Event types for realtime subscriptions
 */
export type RealtimeEventType =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'broadcast'
  | 'presence';

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  table?: string;
  schema?: string;
  old?: T;
  new?: T;
  event?: string;
  payload?: T;
}

type EventCallback<T = unknown> = (event: RealtimeEvent<T>) => void;

interface Subscription {
  table: string;
  event: RealtimeEventType;
  callback: EventCallback;
}

/**
 * Mock bus for testing Supabase Realtime subscriptions
 */
export function createRealtimeMockBus() {
  const subscriptions: Subscription[] = [];
  const channels: Map<string, { subscriptions: Subscription[]; status: string }> = new Map();

  return {
    /**
     * Subscribe to realtime events
     */
    subscribe(table: string, event: RealtimeEventType, callback: EventCallback) {
      const subscription = { table, event, callback };
      subscriptions.push(subscription);
      return () => {
        const index = subscriptions.indexOf(subscription);
        if (index > -1) subscriptions.splice(index, 1);
      };
    },

    /**
     * Emit an event to all matching subscriptions
     */
    emit<T>(table: string, event: RealtimeEventType, data: Partial<RealtimeEvent<T>>) {
      const matchingSubscriptions = subscriptions.filter(
        sub => sub.table === table && sub.event === event
      );

      matchingSubscriptions.forEach(sub => {
        sub.callback({
          type: event,
          table,
          ...data,
        } as RealtimeEvent<T>);
      });
    },

    /**
     * Emit an INSERT event
     */
    emitInsert<T>(table: string, newRecord: T) {
      this.emit(table, 'INSERT', { new: newRecord });
    },

    /**
     * Emit an UPDATE event
     */
    emitUpdate<T>(table: string, oldRecord: T, newRecord: T) {
      this.emit(table, 'UPDATE', { old: oldRecord, new: newRecord });
    },

    /**
     * Emit a DELETE event
     */
    emitDelete<T>(table: string, oldRecord: T) {
      this.emit(table, 'DELETE', { old: oldRecord });
    },

    /**
     * Emit a broadcast event
     */
    emitBroadcast<T>(channel: string, event: string, payload: T) {
      this.emit(channel, 'broadcast', { event, payload });
    },

    /**
     * Create a mock channel for subscription
     */
    createChannel(name: string) {
      const channelSubs: Subscription[] = [];

      const channel = {
        on: vi.fn((event: string, config: { table?: string; event?: RealtimeEventType } | EventCallback, callback?: EventCallback) => {
          if (typeof config === 'function') {
            // Broadcast style: .on('broadcast', callback)
            const sub = { table: name, event: event as RealtimeEventType, callback: config };
            channelSubs.push(sub);
            subscriptions.push(sub);
          } else if (callback) {
            // Postgres changes style: .on('postgres_changes', { table, event }, callback)
            const sub = {
              table: config.table || name,
              event: config.event || event as RealtimeEventType,
              callback
            };
            channelSubs.push(sub);
            subscriptions.push(sub);
          }
          return channel;
        }),
        subscribe: vi.fn(() => {
          channels.set(name, { subscriptions: channelSubs, status: 'SUBSCRIBED' });
          return Promise.resolve({ status: 'SUBSCRIBED' });
        }),
        unsubscribe: vi.fn(() => {
          channels.delete(name);
          channelSubs.forEach(sub => {
            const index = subscriptions.indexOf(sub);
            if (index > -1) subscriptions.splice(index, 1);
          });
          channelSubs.length = 0;
        }),
        _channelSubs: channelSubs,
      };

      return channel;
    },

    /**
     * Clear all subscriptions
     */
    clear() {
      subscriptions.length = 0;
      channels.clear();
    },

    /**
     * Get subscription count
     */
    get subscriptionCount() {
      return subscriptions.length;
    },

    /**
     * Get all subscriptions for a table
     */
    getSubscriptions(table: string) {
      return subscriptions.filter(sub => sub.table === table);
    },

    /**
     * Check if subscribed to a table/event
     */
    isSubscribed(table: string, event?: RealtimeEventType) {
      return subscriptions.some(
        sub => sub.table === table && (event === undefined || sub.event === event)
      );
    },
  };
}

/**
 * Create a mock Supabase client with realtime support
 */
export function createSupabaseClientWithRealtime(bus = createRealtimeMockBus()) {
  return {
    channel: vi.fn((name: string) => bus.createChannel(name)),
    removeChannel: vi.fn((channel: { unsubscribe: () => void }) => {
      channel.unsubscribe();
    }),
    _realtimeBus: bus,
  };
}

// Export types
export type RealtimeMockBus = ReturnType<typeof createRealtimeMockBus>;
