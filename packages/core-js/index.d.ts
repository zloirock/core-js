// Type definitions for core-js 3.49
// Project: https://github.com/zloirock/core-js
// Definitions for the global polyfills provided by core-js
//
// This file augments the global interfaces with methods that core-js polyfills.
// It covers: es.array.*, es.object.*, es.promise.*, es.string.*

// ---------------------------------------------------------------------------
// Array
// ---------------------------------------------------------------------------

interface Array<T> {
  /**
   * Returns the item at the given index, allowing for positive and negative integers.
   * Negative integers count back from the last item in the array.
   */
  at(index: number): T | undefined;

  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   */
  findLast<S extends T>(
    predicate: (value: T, index: number, array: T[]) => value is S,
    thisArg?: any,
  ): S | undefined;
  findLast(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any,
  ): T | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   */
  findLastIndex(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any,
  ): number;

  /**
   * Returns a new array with all sub-array elements concatenated into it
   * recursively up to the specified depth.
   */
  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];

  /**
   * Calls a defined callback function on each element of an array. Then, flattens
   * the result into a new array. This is identical to a map followed by flat with depth 1.
   */
  flatMap<U>(
    callback: (value: T, index: number, array: T[]) => U | ReadonlyArray<U>,
    thisArg?: any,
  ): U[];

  /**
   * Determines whether an array includes a certain element.
   */
  includes(searchElement: T, fromIndex?: number): boolean;

  /**
   * Copies the array and returns the new array with the elements in reverse order.
   */
  toReversed(): T[];

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements.
   */
  toSorted(compareFn?: (a: T, b: T) => number): T[];

  /**
   * Copies the array and removes elements and, if necessary, inserts new elements
   * in their place, returning the new array.
   */
  toSpliced(start: number, deleteCount?: number, ...items: T[]): T[];

  /**
   * Copies the array and replaces the element at the given index with the provided value.
   */
  with(index: number, value: T): T[];
}

interface ReadonlyArray<T> {
  at(index: number): T | undefined;

  findLast<S extends T>(
    predicate: (value: T, index: number, array: readonly T[]) => value is S,
    thisArg?: any,
  ): S | undefined;
  findLast(
    predicate: (value: T, index: number, array: readonly T[]) => unknown,
    thisArg?: any,
  ): T | undefined;

  findLastIndex(
    predicate: (value: T, index: number, array: readonly T[]) => unknown,
    thisArg?: any,
  ): number;

  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];

  flatMap<U>(
    callback: (value: T, index: number, array: readonly T[]) => U | ReadonlyArray<U>,
    thisArg?: any,
  ): U[];

  includes(searchElement: T, fromIndex?: number): boolean;

  toReversed(): T[];
  toSorted(compareFn?: (a: T, b: T) => number): T[];
  toSpliced(start: number, deleteCount?: number, ...items: T[]): T[];
  with(index: number, value: T): T[];
}

interface ArrayConstructor {
  /**
   * Creates an array from an iterable or array-like object.
   */
  from<T>(arrayLike: ArrayLike<T> | Iterable<T>): T[];
  from<T, U>(
    arrayLike: ArrayLike<T> | Iterable<T>,
    mapfn: (v: T, k: number) => U,
    thisArg?: any,
  ): U[];

  /**
   * Creates an array from an async iterable or iterable or array-like object.
   */
  fromAsync<T>(
    asyncItems: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>,
  ): Promise<T[]>;
  fromAsync<T, U>(
    asyncItems: AsyncIterable<T> | Iterable<T> | ArrayLike<T>,
    mapFn: (value: Awaited<T>) => U,
    thisArg?: any,
  ): Promise<Awaited<U>[]>;

  /**
   * Creates a new array from a variable number of arguments.
   */
  of<T>(...items: T[]): T[];

  /**
   * Determines whether the passed value is an Array.
   */
  isArray(arg: any): arg is any[];
}

// ---------------------------------------------------------------------------
// Object
// ---------------------------------------------------------------------------

interface ObjectConstructor {
  /**
   * Copy the values of all of the enumerable own properties from one or more
   * source objects to a target object. Returns the target object.
   */
  assign<T extends {}, U>(target: T, source: U): T & U;
  assign<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
  assign<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
  assign(target: object, ...sources: any[]): any;

  /**
   * Returns an array of key/values of the enumerable own properties of an object.
   */
  entries<T>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];
  entries(o: {}): [string, any][];

  /**
   * Creates an object from an iterable of key-value pairs.
   */
  fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k: string]: T };
  fromEntries(entries: Iterable<readonly any[]>): any;

  /**
   * Returns the names of the enumerable string properties and methods of an object.
   */
  keys(o: object): string[];

  /**
   * Returns an array of values of the enumerable own properties of an object.
   */
  values<T>(o: { [s: string]: T } | ArrayLike<T>): T[];
  values(o: {}): any[];

  /**
   * Groups members of an iterable according to the return value of the passed callback.
   */
  groupBy<K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Partial<Record<K, T[]>>;

  /**
   * Determines whether an object has a property with the specified name.
   */
  hasOwn(o: object, v: PropertyKey): boolean;

  /**
   * Returns an object containing all own property descriptors of an object.
   */
  getOwnPropertyDescriptors<T>(
    o: T,
  ): { [P in keyof T]: TypedPropertyDescriptor<T[P]> } & {
    [x: string]: PropertyDescriptor;
  };

  /**
   * Determines whether two values are the same value.
   */
  is(value1: any, value2: any): boolean;
}

// ---------------------------------------------------------------------------
// Promise
// ---------------------------------------------------------------------------

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve, or rejected when any Promise is rejected.
   */
  all<T extends readonly unknown[] | []>(
    values: T,
  ): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve or reject.
   */
  allSettled<T extends readonly unknown[] | []>(
    values: T,
  ): Promise<{
    -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>;
  }>;
  allSettled<T>(
    values: Iterable<T | PromiseLike<T>>,
  ): Promise<PromiseSettledResult<Awaited<T>>[]>;

  /**
   * The any function returns a promise that is fulfilled by the first given
   * promise to be fulfilled, or rejected with an AggregateError containing
   * an array of rejection reasons if all of the given promises are rejected.
   */
  any<T extends readonly unknown[] | []>(
    values: T,
  ): Promise<Awaited<T[number]>>;
  any<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;

  /**
   * Creates a new Promise and returns it in an object, along with its
   * resolve and reject functions.
   */
  withResolvers<T>(): PromiseWithResolvers<T>;

  /**
   * Takes a callback of any kind (returns or throws, synchronously or
   * asynchronously) and wraps its result in a Promise.
   */
  try<T, A extends unknown[]>(
    callbackfn: (...args: A) => T | PromiseLike<T>,
    ...args: A
  ): Promise<T>;
}

// ---------------------------------------------------------------------------
// String
// ---------------------------------------------------------------------------

interface String {
  /**
   * Returns the character at the given index, allowing for positive and
   * negative integers. Negative integers count back from the last character.
   */
  at(index: number): string | undefined;

  /**
   * Determines whether a string includes the characters of a specified string.
   */
  includes(searchString: string, position?: number): boolean;

  /**
   * Returns true if the sequence of elements of searchString converted to a
   * String is the same as the corresponding elements of this object starting
   * at position.
   */
  startsWith(searchString: string, position?: number): boolean;

  /**
   * Returns true if the sequence of elements of searchString converted to a
   * String is the same as the corresponding elements of this object starting
   * at endPosition - length(searchString).
   */
  endsWith(searchString: string, endPosition?: number): boolean;

  /**
   * Pads the current string with a given string so that the resulting string
   * reaches a given length. Padding is applied from the start.
   */
  padStart(maxLength: number, fillString?: string): string;

  /**
   * Pads the current string with a given string so that the resulting string
   * reaches a given length. Padding is applied from the end.
   */
  padEnd(maxLength: number, fillString?: string): string;

  /**
   * Removes whitespace from the beginning of a string.
   */
  trimStart(): string;

  /**
   * Removes whitespace from the end of a string.
   */
  trimEnd(): string;

  /**
   * Replaces all occurrences of a string or RegExp with a replacement string,
   * and returns the new string.
   */
  replaceAll(
    searchValue: string | RegExp,
    replaceValue: string | ((substring: string, ...args: any[]) => string),
  ): string;

  /**
   * Returns a String value that is made from count copies appended together.
   */
  repeat(count: number): string;

  /**
   * Returns an iterator of all results matching a string against a regular expression,
   * including capturing groups.
   */
  matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray>;

  /**
   * Returns the String value result of normalizing the string into the normalization
   * form named by form.
   */
  codePointAt(pos: number): number | undefined;

  /**
   * Checks whether the string is well-formed (contains no lone surrogates).
   */
  isWellFormed(): boolean;

  /**
   * Returns a string where any lone surrogates are replaced with U+FFFD.
   */
  toWellFormed(): string;
}

interface StringConstructor {
  /**
   * Returns a string created from the specified sequence of UTF-16 code units.
   */
  fromCodePoint(...codePoints: number[]): string;

  /**
   * String.raw is intended for use as a tag function of a Tagged Template String.
   */
  raw(template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): string;
}

// ---------------------------------------------------------------------------
// Iterator Helpers (es.iterator.*)
// ---------------------------------------------------------------------------

// Note: core-js also polyfills structured clone, URL, Map, Set, Symbol,
// WeakMap, WeakSet, TypedArrays, and more. Those are not covered here.

export {};
