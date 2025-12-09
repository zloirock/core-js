interface VoidFunction { // @type-options no-redefine no-prefix no-extends
  (): void;
}

/**
 * Queues a microtask to be executed at a later time.
 * @param callback A function to be executed in the microtask.
 */
declare function queueMicrotask(callback: VoidFunction): void;
