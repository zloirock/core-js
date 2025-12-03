// proposal stage: 1
// https://github.com/tc39/proposal-array-filtering

declare namespace CoreJS {
  interface CoreJSArray<T> extends Array<T> {
    /**
     * Removes the items that return true
     * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
     * callbackFn function one time for each element in the array.
     * @param thisArg If provided, it will be used as this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    filterReject(callbackFn: (value: T, index: number, target: T[]) => boolean, thisArg?: any): T[];
  }
}
