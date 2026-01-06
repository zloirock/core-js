declare namespace CoreJS {
  export interface CoreJSSet<T> extends Set<T> {}

  export interface CoreJSSetConstructor extends SetConstructor {
    new <T = any>(values?: readonly T[] | null): CoreJSSet<T>;
    readonly prototype: CoreJSSet<any>;
  }

  var CoreJSSet: CoreJSSetConstructor;
}
