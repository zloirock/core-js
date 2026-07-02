// `const { prototype: name } = ...` - treating a constructor's `prototype` as an instance
// reads via destructure when init resolves to a known constructor.
const { prototype: ArrPrototype } = Array;
ArrPrototype.at(0);
