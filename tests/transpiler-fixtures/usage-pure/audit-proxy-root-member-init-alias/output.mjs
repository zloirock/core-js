import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a proxy root can be captured through a MEMBER read (`const s = globalThis.self`), not only through a
// bare name. both sides follow that init through ONE walk - the proxy recogniser narrows the value
// canon's answer to the realm names rather than re-deriving it. the rows pin the capability: an alias
// bound to a member read still names the proxy surface, so a mutation through it registers and a plain
// read through it resolves. the second row is the Identifier-init twin
const viaMember = _self;
const viaName = _globalThis;

// the alias holds a member-captured proxy root: the read through it must resolve to the global surface
export function memberCapturedRootResolves() {
  var _ref;
  return _atMaybeArray(_ref = _Array$from([1, 2])).call(_ref, 0);
}

// the Identifier-init twin: the same capability through a bare-name capture
export function nameCapturedRootResolves() {
  var _ref2;
  return _includesMaybeArray(_ref2 = _Array$from([3, 4])).call(_ref2, 3);
}