// https://github.com/tc39/proposal-Array.prototype.includes

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2016.array.include.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> { // @type-options no-redefine
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: T, fromIndex?: number): boolean;
}

interface ReadonlyArray<T> { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: T, fromIndex?: number): boolean;
}

interface Int8Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint8Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint8ClampedArray { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Int16Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint16Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Int32Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint32Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Float32Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Float64Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface BigInt64Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: bigint, fromIndex?: number): boolean;
}

interface BigUint64Array { // @type-options no-export
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement - The element to search for.
   * @param fromIndex - The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement: bigint, fromIndex?: number): boolean;
}
