// https://github.com/tc39/proposal-set-methods

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/esnext.collection.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ReadonlySetLike<T> { // @type-options: no-extends, no-prefix
  /**
   * Despite its name, returns an iterator of the values in the set-like.
   */
  keys(): Iterator<T>;

  /**
   * @returns a boolean indicating whether an element with the specified value exists in the set-like or not.
   */
  has(value: T): boolean;

  /**
   * @returns the number of (unique) elements in the set-like.
   */
  readonly size: number;
}

interface Set<T> { // @type-options: no-redefine
  /**
   * @returns a new Set containing all the elements in this Set and also all the elements in the argument.
   */
  union<U>(other: ReadonlySetLike<U>): Set<T | U>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements which are both in this Set and in the argument.
   */
  intersection<U>(other: ReadonlySetLike<U>): Set<T & U>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements in this Set which are not also in the argument.
   */
  difference<U>(other: ReadonlySetLike<U>): Set<T>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements which are in either this Set or in the argument, but not in both.
   */
  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U>; // @type-options: prefix-return-type

  /**
   * @returns a boolean indicating whether all the elements in this Set are also in the argument.
   */
  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;

  /**
   * @returns a boolean indicating whether all the elements in the argument are also in this Set.
   */
  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;

  /**
   * @returns a boolean indicating whether this Set has no elements in common with the argument.
   */
  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}

interface ReadonlySet<T> { // @type-options: no-redefine
  /**
   * @returns a new Set containing all the elements in this Set and also all the elements in the argument.
   */
  union<U>(other: ReadonlySetLike<U>): Set<T | U>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements which are both in this Set and in the argument.
   */
  intersection<U>(other: ReadonlySetLike<U>): Set<T & U>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements in this Set which are not also in the argument.
   */
  difference<U>(other: ReadonlySetLike<U>): Set<T>; // @type-options: prefix-return-type

  /**
   * @returns a new Set containing all the elements which are in either this Set or in the argument, but not in both.
   */
  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U>; // @type-options: prefix-return-type

  /**
   * @returns a boolean indicating whether all the elements in this Set are also in the argument.
   */
  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;

  /**
   * @returns a boolean indicating whether all the elements in the argument are also in this Set.
   */
  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;

  /**
   * @returns a boolean indicating whether this Set has no elements in common with the argument.
   */
  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}
