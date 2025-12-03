// proposal stage: 1
// https://github.com/tc39/proposal-array-unique

declare namespace CoreJS {
  interface CoreJSArray<T> extends Array<T> {
    /**
     * Returns a new array with unique items, determined by the resolver function or property key
     * @param resolver A function that resolves the value to check uniqueness against,
     * or a property key to compare the value from each item
     * @returns A new `Array` with unique items
     */
    uniqueBy(resolver?: keyof T | ((value: T) => any)): Array<T>;
  }
}
