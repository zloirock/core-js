import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _SuppressedError from "@core-js/pure/actual/suppressed-error";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url";
// A constructor a READ hands out through a call's result or a selection takes its whole family:
// the read steps through a call to what the callee returns and through each arm a selection may
// yield, at a member read and at every level of a pattern. A parameter-filled slot holds its own
// call's argument, so a constructor another call passes stays home. one constructor per row
const flag = _globalThis.flag;
const f = x => ({
  a: x,
  b: 1
});
function twice() {
  if (flag) return {
    a: _URL
  };
  return {
    a: null
  };
}
function pair() {
  if (flag) return {
    a: _AggregateError
  };
  return {
    a: null
  };
}
const selected = flag ? {
  a: _SuppressedError
} : {
  a: null
};
export const viaCallSlot = f(_Map).a;
export const viaReturns = twice().a;
export const viaSelection = selected.a;
export const {
  a: viaPattern
} = pair();
export const {
  k: {
    a: viaNested
  }
} = {
  k: f(_Promise)
};
export const {
  a: viaLogical
} = flag || {
  a: _Iterator
};
export const viaOtherSlot = f(_Symbol).b;