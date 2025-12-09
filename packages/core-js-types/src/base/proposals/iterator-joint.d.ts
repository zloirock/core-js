/// <reference types="../core-js-types/iterator-object.ts" />

// proposal stage: 2.7
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
  zip<T, U>(iterables: Iterable<U>, options?: ZipOptions): CoreJS.CoreJSIteratorObject<[T, U]>;

  /**
   * takes an object whose values are iterables and produces an iterable of objects where keys.
   * correspond to keys in the passed object.
   * @param iterables An Iterable of iterables.
   * @param options Optional object:
   *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
   *  - padding: an object specifying padding values for each key when mode is 'longest'.
   * @returns An iterator yielding objects with keys from the input iterables and values from the corresponding iterables.
   */
  zipKeyed<T, U>(iterables: Iterable<U>, options?: ZipOptions): CoreJS.CoreJSIteratorObject<[number, T, U]>;
  /**
   * takes an object whose values are iterables and produces an iterable of objects where keys.
   * correspond to keys in the passed object.
   * @param record An object of iterables.
   * @param options Optional object:
   *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
   *  - padding: an object specifying padding values for each key when mode is 'longest'.
   * @returns An iterator yielding objects with keys from the input record and values from the corresponding iterables.
   */
  zipKeyed<T, U>(record: Record<PropertyKey, Iterable<U>>, options?: ZipOptions): CoreJS.CoreJSIteratorObject<[PropertyKey, T, U]>;
}

declare var Iterator: IteratorConstructor;
