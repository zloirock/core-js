// destructure-form of `Array.prototype`: `P.at(0)` routes through Array-specific helper
const { prototype: ArrProto } = Array;
ArrProto.at(0);
