import _Array$from from "@core-js/pure/actual/array/from";
// `from` here is destructured from the Array constructor itself (Array.from). the binding HOLDS the
// static, so it is substituted whether or not anything invokes it - a target without the native
// would otherwise hand `record` an undefined. what the head destructures is the ELEMENT of the
// iterated literal, and the mirror puts the polyfill there: no minted binding, no relocation, and
// the shape survives a later for-of lowering, which a body-hosted extraction would not
for (var {
  from
} of [{
  from: _Array$from
}]) {
  record(from);
}