// assignment-expression destructure with sibling rest property: outer `...rest` gathers all
// OTHER own keys, so the proxy-flatten path must keep the rest-binding intact - emitting a
// `_unused` sentinel plus a separate polyfill assignment so rest is preserved AND polyfill
// always wins. inner-level rest (`{Array: {from, ...inner}}`) hits the same constraint
let from, rest, fromEntries, inner;
({ Array: { from }, ...rest } = globalThis);
({ Object: { fromEntries, ...inner } } = globalThis);
