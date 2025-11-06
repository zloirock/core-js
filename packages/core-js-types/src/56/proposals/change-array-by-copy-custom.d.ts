// proposal stage: 4
// https://github.com/tc39/proposal-change-array-by-copy

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/6afd0fb73fa18a48021ed54f44a0c51794519bf6/src/lib/es2023.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export type ArrayToSpliced<T> = ((start: number, deleteCount: number, ...items: T[]) => T[]) | ((start: number, deleteCount?: number)=> T[]);
}
