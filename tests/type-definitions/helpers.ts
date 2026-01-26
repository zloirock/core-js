interface CoreJSPromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;

  finally(onfinally?: (() => void) | undefined | null): PromiseLike<T>;
}
export function assertCoreJSPromiseLike<T>(value: CoreJSPromiseLike<T>): asserts value is CoreJSPromiseLike<T> {}

export interface CoreJSMapLike<K, V> extends Map<K, V> {
  getOrInsert(key: K, value: V): V;

  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
export function assertCoreJSMapLike<K, V>(value: CoreJSMapLike<K, V>): asserts value is CoreJSMapLike<K, V> {}

export interface CoreJSWeakMapLike<K extends WeakKey, V> extends WeakMap<K, V> {
  getOrInsert(key: K, value: V): V;

  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
export function assertCoreJSWeakMapLike<K extends WeakKey, V>(value: CoreJSWeakMapLike<K, V>): asserts value is CoreJSWeakMapLike<K, V> {}

export interface CoreJSSetLike<T> extends Set<T> {
  union<U>(...args: any[]): CoreJSSetLike<T | U>;
  intersection<U>(...args: any[]): CoreJSSetLike<T & U>;
  difference(...args: any[]): CoreJSSetLike<T>;
  symmetricDifference<U>(...args: any[]): CoreJSSetLike<T | U>;
  isSubsetOf(...args: any[]): boolean;
  isSupersetOf(...args: any[]): boolean;
  isDisjointFrom(...args: any[]): boolean;
}
export function assertCoreJSSetLike<T>(value: CoreJSSetLike<T>): asserts value is CoreJSSetLike<T> {}

export interface CoreJSWeakSetLike<T extends WeakKey> extends WeakSet<T> {}
export function assertCoreJSWeakSetLike<T extends WeakKey>(value: CoreJSWeakSetLike<T>): asserts value is CoreJSWeakSetLike<T> {}

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
export function assertCoreJSIteratorLike<T>(value: CoreJSIteratorLike<T>): asserts value is CoreJSIteratorLike<T> {}

interface CoreJSAsyncIteratorLike<T> {
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
export function assertCoreJSAsyncIteratorLike<T>(value: CoreJSAsyncIteratorLike<T>): asserts value is CoreJSAsyncIteratorLike<T> {}

type HasCause<T> = 'cause' extends keyof T ? T : never;
export function assertHasCause<T extends object>(value: T): asserts value is HasCause<T> & { cause: unknown } {}
