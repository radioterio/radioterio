import { injectable, inject } from "inversify";

import { RedisService } from "./client.js";
import { PromiseQueue } from "./queue.js";

export type Unsubscribe = () => void;

@injectable()
export class RedisPubSubService {
  private channelSubscriptions: Map<string, Set<(message: string) => void>> = new Map();
  private queue: PromiseQueue = new PromiseQueue();

  constructor(@inject(RedisService) private readonly redisService: RedisService) {
    const subscriber = this.redisService.getSubscriber();

    // Set up message handler for all channels
    subscriber.on("message", (channel: string, message: string) => {
      const callbacks = this.channelSubscriptions.get(channel);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error(`Error in subscription callback for channel ${channel}:`, error);
          }
        });
      }
    });
  }

  /**
   * Publish a message to a Redis channel.
   */
  async publish(key: string, msg: string): Promise<void> {
    await this.redisService.getPublisher().publish(key, msg);
  }

  /**
   * Subscribe to a Redis channel.
   * Returns an unsubscribe function that can be called to stop receiving messages.
   * This method is safe from race conditions using per-channel promise queue.
   */
  async subscribe(key: string, callback: (message: string) => void): Promise<Unsubscribe> {
    return this.queue.enqueue(key, async () => {
      // Check if this is the first subscription to this channel
      const isFirstSubscription = !this.channelSubscriptions.has(key);

      // Add callback to the set of callbacks for this channel
      const callbacks = this.channelSubscriptions.get(key) ?? new Set();
      callbacks.add(callback);
      this.channelSubscriptions.set(key, callbacks);

      // Subscribe to Redis channel if this is the first subscription
      if (isFirstSubscription) {
        try {
          await this.redisService.getSubscriber().subscribe(key);
        } catch (error) {
          // If subscription fails, roll back the callback
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.channelSubscriptions.delete(key);
          } else {
            this.channelSubscriptions.set(key, callbacks);
          }
          throw error;
        }
      }

      // Return unsubscribe function
      return () => {
        this.unsubscribe(key, callback).catch((err: unknown) => {
          console.error(`Error unsubscribing from channel ${key}:`, err);
        });
      };
    });
  }

  /**
   * Unsubscribe from a channel.
   * This method is safe from race conditions using per-channel promise queue.
   */
  private async unsubscribe(key: string, callback: (message: string) => void): Promise<void> {
    await this.queue.enqueue(key, async () => {
      const callbacks = this.channelSubscriptions.get(key);
      if (!callbacks) {
        // Already unsubscribed or never subscribed, nothing to do
        return;
      }

      callbacks.delete(callback);

      // If no more callbacks, unsubscribe from Redis
      if (callbacks.size === 0) {
        this.channelSubscriptions.delete(key);
        try {
          await this.redisService.getSubscriber().unsubscribe(key);
        } catch (error) {
          // If unsubscribe fails, restore the callback set
          this.channelSubscriptions.set(key, callbacks);
          throw error;
        }
      } else {
        // Update the map with the modified set
        this.channelSubscriptions.set(key, callbacks);
      }
    });
  }

  /**
   * Clean up all subscriptions (does not disconnect Redis connections).
   * The Redis connections are managed by RedisService.
   * This method waits for all pending operations to complete before cleaning up.
   */
  async cleanup(): Promise<void> {
    // Wait for all pending operations to complete
    await this.queue.waitForAll();

    // Unsubscribe from all channels
    const channels = Array.from(this.channelSubscriptions.keys());
    if (channels.length > 0) {
      await this.redisService.getSubscriber().unsubscribe(...channels);
    }

    this.channelSubscriptions.clear();
    this.queue.clear();
  }
}

