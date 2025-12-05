declare namespace CoreJS {
  interface PromiseFulfilledResult<T> { status: "fulfilled"; value: T; }

  interface PromiseRejectedResult { status: "rejected"; reason: any; }

  export type CoreJSPromiseSettledResult<T> = typeof globalThis extends { PromiseSettledResult: infer O }  // from ts 3.8 and es2020
    ? O
    : PromiseFulfilledResult<T> | PromiseRejectedResult;
}
