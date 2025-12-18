// Motivation: Custom type needed to keep generics strict

// https://github.com/tc39/proposal-flatMap

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2019.array.d.ts#L46
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export type ArrayFlatMap<T, U, This = undefined> = (callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: This) => U[];
}
