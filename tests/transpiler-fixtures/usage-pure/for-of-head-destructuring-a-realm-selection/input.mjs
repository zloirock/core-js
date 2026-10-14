// A for-of head destructuring a realm selection out of an array literal: unplugin mirrors the realm arm with
// its static and instance leaves served (the sidecar), while babel keeps the whole head native - its debt,
// which leaves both leaves unpolyfilled.
for (const { Array: { prototype: { at }, of } } of [c ? globalThis : fb]) use(at, of);
