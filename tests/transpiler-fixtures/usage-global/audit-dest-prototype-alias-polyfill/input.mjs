// destructure-form of `Array.prototype`: `P.at(0)` injects `es.array.at` side-effect
const { prototype: ArrProto } = Array;
ArrProto.at(0);
