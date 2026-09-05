// a namespace body is a var-scope owner like a function's: a use inside it sees the hoisted `var`
// of every enclosing owner, so a nested-block `var Map` shadows the global for a `new Map()` inside
// `namespace N {}` exactly as it does for one outside - neither leg may substitute the ponyfill
// over the user's constructor
declare const LegacyMap: any;
{
  var Map = LegacyMap;
}
export namespace N {
  export const inside = new Map();
}
export const outside = new Map();