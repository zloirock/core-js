export interface CoreJSPromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;

  finally(onfinally?: (() => void) | undefined | null): PromiseLike<T>;
}
export type CoreJSPromiseAndPromiseLike<T> = CoreJSPromiseLike<T> & Promise<T>;

export interface CoreJSMapLike<K, V> extends Map<K, V> {
  getOrInsert(key: K, value: V): V;

  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
export type CoreJSMapAndMapLike<K, V> = CoreJSMapLike<K, V> & Map<K, V>;

export interface CoreJSWeakMapLike<K extends WeakKey, V> extends WeakMap<K, V> {
  getOrInsert(key: K, value: V): V;

  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
export type CoreJSWeakMapAndWeakMapLike<K extends WeakKey, V> = CoreJSWeakMapLike<K, V> & WeakMap<K, V>;

export interface CoreJSSetLike<T> extends Set<T> {
  union<U>(...args: any[]): CoreJSSetLike<T | U>;
  intersection<U>(...args: any[]): CoreJSSetLike<T & U>;
  difference(...args: any[]): CoreJSSetLike<T>;
  symmetricDifference<U>(...args: any[]): CoreJSSetLike<T | U>;
  isSubsetOf(...args: any[]): boolean;
  isSupersetOf(...args: any[]): boolean;
  isDisjointFrom(...args: any[]): boolean;
}
export type CoreJSSetAndSetLike<T> = CoreJSSetLike<T> & Set<T>;

export interface CoreJSWeakSetLike<T extends WeakKey> extends WeakSet<T> {}
export type CoreJSWeakSetAndWeakSetLike<T extends WeakKey> = CoreJSWeakSetLike<T> & WeakSet<T>;

export interface CoreJSIteratorLike<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {
  chunks(...args: any[]): CoreJSIteratorLike<T[]>;
  windows(...args: any[]): CoreJSIteratorLike<T[]>;
  map<U>(...args: any[]): CoreJSIteratorLike<U>;
  filter<S extends T>(...args: any[]): CoreJSIteratorLike<S>;
  take(...args: any[]): CoreJSIteratorLike<T>;
  drop(...args: any[]): CoreJSIteratorLike<T>;
  flatMap<U>(...args: any[]): CoreJSIteratorLike<U>;
  reduce<U>(...args: any[]): CoreJSIteratorLike<U>;
  toArray(): T[];
  forEach(...args: any[]): void;
  some(...args: any[]): boolean;
  every(...args: any[]): boolean;
  find(...args: any[]): T | undefined;
  join(...args: any[]): string;
}
export type CoreJSIteratorAndIteratorLike<T> = CoreJSIteratorLike<T> & Iterator<T>;

export interface CoreJSAsyncIteratorLike<T> {
  drop(...args: any[]): any;
  every(...args: any[]): any;
  filter(predicate: (value: T, index: number) => boolean): CoreJSAsyncIteratorLike<T>;
  find(...args: any[]): any;
  flatMap(...args: any[]): any;
  forEach(...args: any[]): any;
  map(mapper: (value: T, index: number) => any): CoreJSAsyncIteratorLike<T>;
  reduce(...args: any[]): any;
  some(...args: any[]): any;
  take(limit: number): CoreJSAsyncIteratorLike<T>;
  toArray(...args: any[]): any;
}
