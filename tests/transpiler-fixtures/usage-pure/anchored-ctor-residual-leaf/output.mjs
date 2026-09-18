import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A MEMBER target left behind by an extraction re-anchors on the ctor's PURE binding like any other
// residual leaf: that binding is what a realm WITHOUT the constructor has instead of it, so keeping
// the native receiver would read a member off `undefined` there - the whole point of the import. The
// pure constructor's surface is not the realm's own - the `*/constructor` entry exposes the ctor's
// instance methods as statics, so `_Iterator.map` answers a function where `Iterator.map` is
// `undefined` - and that is the pure flavor's own (legacy) calling convention, not a reason to drop
// the import. The two controls keep the rule from widening: a static's own ponyfill IS a function
// value, so an instance member read off it still dispatches; and a NAME leaf BINDING under a ctor
// residual is served by the ordinary claim, its only route.
const box = {};
let from;
({
  map: box.m
} = _Iterator);
from = _Iterator$from;
export const anchored = ['m' in box, typeof from];
const staticName = _nameMaybeFunction(_Array$of);
export const staticPonyfillMember = typeof staticName;
let ctorName;
ctorName = _nameMaybeFunction(_Promise);
export const ctorResidualName = typeof ctorName;