// `typeof NS.foo.bar` 2-deep through object literal init: type resolver walks nested
// members through the init shape. `bar` is `Array<number>`, so `.at(0)` dispatches the
// array-narrowed polyfill rather than the generic helper
const NS = { foo: { bar: [1, 2, 3] } };
declare const x: typeof NS.foo.bar;
x.at(0);
