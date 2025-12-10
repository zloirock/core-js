// proposal stage: 4
// https://github.com/tc39/proposal-promise-finally

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2018.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Promise<T> {
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}
