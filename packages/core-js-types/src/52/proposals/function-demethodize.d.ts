// proposal stage: 0
// https://github.com/js-choi/proposal-function-demethodize
interface Function {
  demethodize<T, Args extends any[], R>(this: (this: T, ...args: Args) => R): (thisArg: T, ...args: Args) => R;
}
