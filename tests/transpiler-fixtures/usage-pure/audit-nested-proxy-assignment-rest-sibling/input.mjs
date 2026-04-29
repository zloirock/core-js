// assignment-expression destructure with sibling rest property: outer pattern's `...rest`
// gathers all OTHER own keys, so the proxy-flatten path keeps the rest-binding intact.
// cascade emits `_unused` sentinel + separate polyfill assignment so rest is preserved
// AND polyfill always wins regardless of native receiver field. inner-level rest property
// (`{Array: {from, ...inner}}`) hits the same constraint - sentinel preservation covered
// by both declaration and assignment-expression cascade paths
let from, rest, fromEntries, inner;
({ Array: { from }, ...rest } = globalThis);
({ Object: { fromEntries, ...inner } } = globalThis);
