import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A call supplying the realm keeps its effects while nested static and instance claims compose.
// Pristine namespace hops need no independent value read after the call.
function realm() {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
}
function quiet() {
  return _globalThis;
}
realm();
export const fromCall = _Map$groupBy;
(0, realm)();
export const fromParenCall = _Map$groupBy;
export const fromQuiet = _Map$groupBy;
realm();
export const fromNoEntry = _Array$of;
let assigned;
realm();
assigned = _Map$groupBy;
export { assigned };
// A nested INSTANCE leaf under a hop off a call the inline canon proves to yield a proxy global,
// running no effect on the way (`const g = () => globalThis`): the call reads as that global on both
// legs - the nav folds onto `_globalThis`, the discarded call owes nothing - beside a static sibling,
// under a sequence prefix (lifted, once), alone, and with a live default.
let eff = 0;
const g = () => _globalThis;
const {
  Array: {
    prototype: {
      flat: nestedBesideStatic
    },
    of: staticBeside
  }
} = (g(), {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
});
const {
  Array: {
    prototype: {
      flat: nestedSeBesideStatic
    },
    of: staticSeBeside
  }
} = (eff++, g(), {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
});
const nestedSeSole = _flatMaybeArray((eff++, _globalThis.Array.prototype));
const nestedSole = _flatMaybeArray(_globalThis.Array.prototype);
const {
  Array: {
    prototype: {
      flat: nestedDefaulted = () => 1
    },
    of: staticDefaultedBeside
  }
} = (eff++, g(), {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
});
export { eff, nestedBesideStatic, staticBeside, nestedSeBesideStatic, staticSeBeside, nestedSeSole, nestedSole, nestedDefaulted, staticDefaultedBeside };