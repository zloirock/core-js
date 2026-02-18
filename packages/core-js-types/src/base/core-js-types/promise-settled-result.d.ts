declare namespace CoreJS {
  interface PromiseFulfilledResult<T> { status: 'fulfilled'; value: T; }

  interface PromiseRejectedResult { status: 'rejected'; reason: unknown; }

  export type CoreJSPromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;
}
