declare namespace CoreJS {
  export interface CoreJSWeakSet<T extends WeakKey> extends WeakSet<T> {}

  export interface CoreJSWeakSetConstructor extends WeakSetConstructor {
    readonly prototype: CoreJSWeakSet<WeakKey>;

    new<T extends WeakKey = WeakKey>(values?: readonly T[] | null): CoreJSWeakSet<T>;
  }

  var CoreJSWeakSet: CoreJSWeakSetConstructor;
}
