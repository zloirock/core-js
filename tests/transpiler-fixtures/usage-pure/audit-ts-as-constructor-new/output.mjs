import _Map from "@core-js/pure/actual/map/constructor";
// `new (X as any)(...)` constructor call wrapped in TS `as any`: the cast is peeled
// so the construction is recognised and polyfilled.
new _Map();
// @ts-expect-error a construction through a cast to unknown is the shape under test
new _Map();