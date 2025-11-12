// proposal stage: 0
// https://github.com/js-choi/proposal-function-demethodize
interface Function {
  /**
   * Creates a function that calls the original with its first argument as `this` and the rest as regular arguments.
   * @returns {Function} A new function that applies the original function with its `this` set to the first argument.
   */
  demethodize<T, Args extends any[], R>(this: (this: T, ...args: Args) => R): (thisArg: T, ...args: Args) => R;
}
