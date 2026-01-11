declare namespace CoreJS {
  export interface CoreJSWeakMap<K extends WeakKey, V> extends WeakMap<K, V> {}

  export interface CoreJSWeakMapConstructor {
    readonly prototype: CoreJSWeakMap<WeakKey, any>;

    new<K extends WeakKey = WeakKey, V = any>(entries?: readonly (readonly [K, V])[] | null): CoreJSWeakMap<K, V>;
    new<K extends WeakKey, V>(iterable: Iterable<readonly [K, V]>): CoreJSWeakMap<K, V>;
  }

  var CoreJSWeakMap: CoreJSWeakMapConstructor;
}
