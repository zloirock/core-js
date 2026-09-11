import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11;
// a MINTED guard whose TEST holds a call-rooted run of UNBACKED realm hops (`window.window` -
// nothing pure can land on) rides the shared plan's swap: the proven effect-free call folds onto
// the root ponyfill and the hops stay where the source wrote them. reading the test's own nav as
// a source read a second time left the raw call standing where the other emitter had swapped it
const f = () => _globalThis;
export const plainRun = null == _globalThis.window.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
export const deadOptionalRun = null == _globalThis.window.window ? void 0 : _atMaybeArray(_ref2 = _Array$of(2)).call(_ref2, 0);
export const threeHops = null == _globalThis.window.window.window ? void 0 : _atMaybeArray(_ref3 = _Array$of(3)).call(_ref3, 0);
export const literalKeyHop = null == _globalThis.window['window'] ? void 0 : _atMaybeArray(_ref4 = _Array$of(4)).call(_ref4, 0);
export const inArgument = String(null == _globalThis.window.window ? void 0 : _atMaybeArray(_ref5 = _Array$of(5)).call(_ref5, 0));
export const dispatchAbove = null == _globalThis.window.window ? void 0 : _atMaybeArray(_ref6 = _Array$of(6)).call(_ref6, 0).toString();

// the IDENTIFIER spelling of the same run is the twin these rows are measured against: its own
// visitor collapses the whole nav, so no guard is minted for it at all
export const identifierTwin = _atMaybeArray(_ref7 = _Array$of(7)).call(_ref7, 0);

// NEGATIVE: a LIVE `?.` inside the run belongs to the guard channels, so the plan stands down
// and the test keeps the source's own spelling
export const liveOptionalRun = null == f()?.window?.window ? void 0 : _atMaybeArray(_ref8 = _Array$of(8)).call(_ref8, 0);

// NEGATIVE: an argument the call OBSERVES has no slot in the swap - the call stays spelled
const arr = [1, 2, 3];
export const observedCallRoot = null == f(_atMaybeArray(arr).call(arr, 0)).window.window ? void 0 : _atMaybeArray(_ref9 = _Array$of(9)).call(_ref9, 0);

// NEGATIVE: an OPAQUE root proves no global, so the run has nothing to ride
const opq = () => ({
  window: {
    window: {
      self: {
        Array
      }
    }
  }
});
export const opaqueRoot = null == (_ref10 = opq().window.window.self) ? void 0 : _at(_ref11 = _ref10.Array.of(10)).call(_ref11, 0);