// proposal stage: 4
// https://github.com/tc39/proposal-object-values-entries

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2017.object.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ObjectConstructor {
  values<T>(o: { [s: string]: T; } | ArrayLike<T>): T[];
  values(o: {}): any[];

  entries<T>(o: { [s: string]: T; } | ArrayLike<T>): [string, T][];
  entries(o: {}): [string, any][];
}
