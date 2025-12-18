// https://github.com/tc39/proposal-object-from-entries

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/d8aafb3197ebecd7faf919eaa39e77c5805cbff8/src/lib/es2019.object.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k: string]: T; };

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries(entries: Iterable<readonly any[]>): any;
}
