// proposal stage: 4
// https://github.com/tc39/proposal-accessible-object-hasownproperty

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2022.object.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt
interface ObjectConstructor {
  /**
   * Determines whether an object has a property with the specified name.
   * @param o An object.
   * @param v A property name.
   */
  hasOwn(o: object, v: PropertyKey): boolean;
}
