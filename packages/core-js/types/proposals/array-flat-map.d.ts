// proposal stage: 4
// https://github.com/tc39/proposal-flatMap

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2019.array.d.ts#L46
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt
interface Array<T> {
  flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: This): U[];

  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];
}
