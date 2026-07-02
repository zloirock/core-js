import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
var _ref;
// pure-version of zero-arg IIFE wrapping ConditionalExpression. since runtime value may
// come from either branch (`fromFallback` flag), destructure rewrite leaves the pattern
// in place and the call's downstream `from([1, 2]).at(0)` falls to generic dispatch --
// the resolver can't pin a single constructor for `from`'s return type, so the chain's
// instance polyfill is the conservative generic helper.
const {
  from
} = (() => cond ? Array : _Iterator)();
_at(_ref = from([1, 2])).call(_ref, 0);