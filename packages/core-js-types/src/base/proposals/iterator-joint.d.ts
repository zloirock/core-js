// https://github.com/tc39/proposal-joint-iteration

type ZipOptions = {
  mode?: 'shortest' | 'longest' | 'strict';

  padding?: object;
};

interface IteratorConstructor { // @type-options no-extends
  /**
   * Takes an iterable of iterables and produces an iterable of arrays where position corresponds
   * to position in the passed iterable.
   * @param iterables An Iterable of iterables.
   * @param options Optional object:
   *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
   *  - padding: an object specifying padding values for each key when mode is 'longest'.
   * @returns An iterator yielding objects with keys from the input iterables and values from the corresponding iterables.
   */
  zip<T>(iterables: Iterable<Iterable<T>>, options?: ZipOptions): IteratorObject<T[]>; // @type-options prefix-return-type

  /**
   * takes an object whose values are iterables and produces an iterable of objects where keys.
   * correspond to keys in the passed object.
   * @param record An object of iterables.
   * @param options Optional object:
   *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
   *  - padding: an object specifying padding values for each key when mode is 'longest'.
   * @returns An iterator yielding objects with keys from the input record and values from the corresponding iterables.
   */
  zipKeyed<T extends { [K in PropertyKey]: Iterable<any> }>(record: T, options?: ZipOptions): IteratorObject<{ [K in keyof T]: T[K] extends Iterable<infer V> ? V : never; }>;  // @type-options prefix-return-type
}

declare var Iterator: IteratorConstructor;
