// inline-array spread at IIFE call site: `(arr => arr)(...[Array])` lifts the spread's
// statically-known element. an earlier wholesale bail on SpreadElement args left the IIFE
// result unrecognised as the polyfillable receiver, even though the param-to-arg matcher
// already expands `...[lit]` spreads elsewhere
const factory = (arr => arr)(...[Array]);
factory.from([1, 2, 3]);
