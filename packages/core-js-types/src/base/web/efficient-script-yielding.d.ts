type Immediate = number | object | undefined; // For compatibility with Node, `undefined` has been added

/**
 * Schedules the execution of a function as soon as possible after the current script yields.
 * @param handler The function to execute.
 * @param args Arguments to pass to the handler function.
 * @returns An identifier that can be used to cancel the scheduled function.
 */
declare function setImmediate(handler: (...args: any[]) => void, ...args: any[]): Immediate;

/**
 * Cancels a function scheduled with setImmediate.
 * @param immediate The identifier of the scheduled function to cancel.
 */
declare function clearImmediate(immediate: Immediate): void;
