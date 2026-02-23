declare namespace CoreJS {
  export interface CoreJSAggregateError extends Error {
    errors: any[];
  }

  export interface CoreJSAggregateErrorConstructor {
    new (errors: Iterable<any>, message?: string): CoreJSAggregateError;
    (errors: Iterable<any>, message?: string): CoreJSAggregateError;
    readonly prototype: CoreJSAggregateError;
  }

  var CoreJSAggregateError: CoreJSAggregateErrorConstructor;
}
