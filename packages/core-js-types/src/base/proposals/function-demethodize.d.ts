// https://github.com/js-choi/proposal-function-demethodize

interface Function { // @type-options no-constructor
  /**
   * Creates a function that calls the original with its first argument as `this` and the rest as regular arguments.
   * @returns A new function that applies the original function with its `this` set to the first argument.
   */
  demethodize<T, Args extends any[], R>(this: (this: T, ...args: Args) => R): (thisArg: T, ...args: Args) => R;
}
