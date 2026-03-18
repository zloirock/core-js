declare namespace CoreJS {
  export interface CoreJSErrorOptions {
    cause?: unknown;
  }

  export interface CoreJSError extends Error {
    cause?: unknown;
  }

  export interface CoreJSErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSError;
    readonly prototype: CoreJSError;
    isError(arg: unknown): arg is CoreJSError;
  }

  var CoreJSError: CoreJSErrorConstructor;

  export interface CoreJSEvalError extends EvalError {
    cause?: unknown;
  }

  export interface CoreJSEvalErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSEvalError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSEvalError;
    readonly prototype: CoreJSEvalError;
  }

  var CoreJSEvalError: CoreJSEvalErrorConstructor;

  export interface CoreJSRangeError extends RangeError {
    cause?: unknown;
  }

  export interface CoreJSRangeErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSRangeError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSRangeError;
    readonly prototype: CoreJSRangeError;
  }

  var CoreJSRangeError: CoreJSRangeErrorConstructor;

  export interface CoreJSReferenceError extends ReferenceError {
    cause?: unknown;
  }

  export interface CoreJSReferenceErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSReferenceError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSReferenceError;
    readonly prototype: CoreJSReferenceError;
  }

  var CoreJSReferenceError: CoreJSReferenceErrorConstructor;

  export interface CoreJSSyntaxError extends SyntaxError {
    cause?: unknown;
  }

  export interface CoreJSSyntaxErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSSyntaxError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSSyntaxError;
    readonly prototype: CoreJSSyntaxError;
  }

  var CoreJSSyntaxError: CoreJSSyntaxErrorConstructor;

  export interface CoreJSTypeError extends TypeError {
    cause?: unknown;
  }

  export interface CoreJSTypeErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSTypeError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSTypeError;
    readonly prototype: CoreJSTypeError;
  }

  var CoreJSTypeError: CoreJSTypeErrorConstructor;

  export interface CoreJSURIError extends URIError {
    cause?: unknown;
  }

  export interface CoreJSURIErrorConstructor {
    new(message?: string, options?: CoreJSErrorOptions): CoreJSURIError;
    (message?: string, options?: CoreJSErrorOptions): CoreJSURIError;
    readonly prototype: CoreJSURIError;
  }

  var CoreJSURIError: CoreJSURIErrorConstructor;
}
