// proposal stage: 3
// https://github.com/tc39/proposal-is-error
interface ErrorConstructor {
  isError(value: unknown): value is Error;
}
