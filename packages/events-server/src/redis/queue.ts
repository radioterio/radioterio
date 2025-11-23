/**
 * A promise-based queue that ensures operations are executed sequentially.
 * Each key has its own queue, so operations for different keys can run in parallel.
 */
export class PromiseQueue {
  private queues: Map<string, Promise<unknown>> = new Map();

  /**
   * Enqueue an operation for a key, ensuring operations are executed sequentially.
   * This provides race-condition safety by serializing all operations per key.
   */
  async enqueue<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // Get the previous operation's promise (or resolved promise if none)
    const previousOperation = this.queues.get(key) ?? Promise.resolve();

    // Chain this operation to the previous one
    const currentOperation = previousOperation.then(async () => {
      return await operation();
    });

    // Store the new promise in the queue
    this.queues.set(key, currentOperation);

    // Await the current operation
    return await currentOperation;
  }

  /**
   * Wait for all pending operations to complete.
   */
  async waitForAll(): Promise<void> {
    const allQueues = Array.from(this.queues.values());
    await Promise.all(allQueues);
  }

  /**
   * Clear all queues.
   */
  clear(): void {
    this.queues.clear();
  }
}

