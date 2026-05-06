import _globalThis from "@core-js/pure/actual/global-this";
// Multi-element ArrayPattern is NOT a transparent wrapper - dropping the whole declarator
// would lose the second destructure target's binding. classifier predicate
// `isTransparentDestructureWrapper` requires `elements.length === 1`, so this shape bails
// to non-flatten path. negative lock: receiver type is unknown, `from` stays a destructure
// binding (no `_Array$from` import) - runtime relies on native Array.from being defined
const [{
  Array: {
    from
  }
}, other] = [_globalThis, {
  foo: 1
}];
from('hi');
other.foo;