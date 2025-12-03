// proposal stage: 4
// https://github.com/tc39/proposal-Array.prototype.includes

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2016.array.include.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  interface CoreJSArray<T> extends Array<T> {
    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     * @param fromIndex The position in this array at which to begin searching for searchElement.
     */
    includes(searchElement: T, fromIndex?: number): boolean;
  }
}
