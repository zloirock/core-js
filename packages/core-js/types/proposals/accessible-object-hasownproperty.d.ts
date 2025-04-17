// proposal stage: 4
// https://github.com/tc39/proposal-accessible-object-hasownproperty
interface ObjectConstructor {
  // https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2022.object.d.ts
  hasOwn(o: object, v: PropertyKey): boolean;
}
