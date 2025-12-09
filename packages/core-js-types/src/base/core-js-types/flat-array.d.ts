// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2019.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export type CoreJSFlatArray<Arr, Depth extends number> = typeof globalThis extends { FlatArray: infer O } // from ts 4.4
    ? O
    : {
      done: Arr;
      recur: Arr extends ReadonlyArray<infer InnerArr> ? CoreJSFlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
        : Arr;
    }[Depth extends -1 ? "done" : "recur"];
}
