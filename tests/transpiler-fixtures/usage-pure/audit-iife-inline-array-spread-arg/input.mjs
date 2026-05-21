// inline-array spread at IIFE call site: `(arr => arr)(...[Array])` lifts the spread's
// statically-known element. used to bail wholesale on SpreadElement args (asymmetric with
// `resolveCallArgument` / `findIifeArgForParam` which already expand `...[lit]`), so the
// IIFE result wasn't recognised as the polyfillable receiver
const factory = (arr => arr)(...[Array]);
factory.from([1, 2, 3]);
