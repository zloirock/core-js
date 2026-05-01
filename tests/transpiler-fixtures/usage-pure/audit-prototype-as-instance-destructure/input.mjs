// `const { prototype: name } = ...` - resolvePrototypeAsInstance reads via destructure
// when init resolves to a known constructor.
const { prototype: ArrPrototype } = Array;
ArrPrototype.at(0);
