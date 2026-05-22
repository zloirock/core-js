import _at from "@core-js/pure/actual/instance/at";
// ReturnType<typeof import('x').fn> reaches `pickLastAmbientOverload` with an
// exprName whose head is TSImportType, not Identifier / TSQualifiedName.
// `collectQualifiedSegments` returns null for that shape, the unified
// `findOverloadsForName` short-circuits, and the resolver falls through to its
// structural bail - the cross-module signature is opaque, so polyfills must
// still inject for the receiver's instance call.
function getFn(): typeof import("foo").fn {
  return null as any;
}
const r = getFn()();
_at(r).call(r, 0);