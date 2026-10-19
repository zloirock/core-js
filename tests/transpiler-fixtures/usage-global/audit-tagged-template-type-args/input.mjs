// explicit type arguments on a tagged template (`tag<Set<number>>`...``) are a type-only
// instantiation hanging off the tag node. babel reaches the global through ReferencedIdentifier;
// the unplugin (oxc) sweep must visit the tag node too or the type-only global drops in unplugin only
function tag(strings) {
  return strings;
}
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const r = tag<Set<number>>`x`;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const s = tag<Map<string, number>>`y`;
