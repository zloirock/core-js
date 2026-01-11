declare namespace CoreJS {
  export interface CoreJSMap<K, V> extends Map<K, V> {}

  export interface CoreJSMapConstructor {
    readonly prototype: CoreJSMap<any, any>;

    new (): CoreJSMap<any, any>;
    new<K, V>(entries?: readonly (readonly [K, V])[] | Iterable<readonly [K, V]> | null): CoreJSMap<K, V>;
  }

  var CoreJSMap: CoreJSMapConstructor;
}
