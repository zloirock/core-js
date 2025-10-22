// proposal stage: 4
// https://github.com/tc39/proposal-object-getownpropertydescriptors

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2017.object.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ObjectConstructor {
  getOwnPropertyDescriptors<T>(o: T): { [P in keyof T]: TypedPropertyDescriptor<T[P]>; } & {
    [x: string]: PropertyDescriptor;
  };
}
