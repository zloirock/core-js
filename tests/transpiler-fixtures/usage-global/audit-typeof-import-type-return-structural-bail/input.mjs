// declared return type `typeof import('x').Bar` with a `return null as any` stub (typical of
// declaration-only helpers). a TSTypeQuery wrapping TSImportType must trigger a structural
// bail; otherwise body inference resolves to the null primitive and drops the `.includes(0)`
// polyfill, even though the cross-module type is opaque and runtime values are unknown.
function getDirect(): import("foo").Bar {
  return null as any;
}
function getTypeofWrapped(): typeof import("foo").Bar {
  return null as any;
}
const a = getDirect();
const b = getTypeofWrapped();
a.at(-1);
b.includes(0);
