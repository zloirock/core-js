// a self-referential PROXY-name binding (`var self = self` / `var globalThis = globalThis`) binds
// afresh like any other: the initializer reads the hoisted `undefined`, so the name stays the user's,
// no proxy root is claimed and no hop collapses. a non-proxy self-cycle (`var Map = Map`) answers the
// same. the control is an unshadowed proxy read, whose hop still collapses onto the ponyfill
var self = self;
const sliced = new self.window.Array(3);
var globalThis = globalThis;
const isArr = globalThis.self.Array.isArray([1]);
var Map = Map;
const m = new Map([['k', 1]]);
const control = window.self.Array.isArray([2]);
