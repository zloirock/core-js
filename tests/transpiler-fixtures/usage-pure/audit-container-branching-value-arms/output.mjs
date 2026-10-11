import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map from "@core-js/pure/actual/map";
import _Math$clz32 from "@core-js/pure/actual/math/clz32";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect from "@core-js/pure/actual/reflect";
import _String$raw from "@core-js/pure/actual/string/raw";
var _ref, _ref2, _ref3;
// Branching container slots do not prove a single static receiver. An arm that is a native static
// owner guards the static it names against the captured slot, as a bare selecting alias guards it
// against the captured constructor; an arm pure swaps whole reads its own statics, and one naming
// no such static leaves the read native. Each row names a distinct method.
const c = typeof document == 'undefined';

// branching IN the slot
const inSlot = {
  Base: c ? Object : Array
};
export const viaSlot = (_ref = inSlot.Base, _ref === Array ? _Array$fromAsync([]) : _ref.fromAsync([]));

// branching OVER the container
const overContainer = c ? {
  Base: Object
} : {
  Base: _Promise
};
export const viaContainer = overContainer.Base.withResolvers();

// branching between container ALIASES
const nsLeft = {
  Base: Object
};
const nsRight = {
  Base: _Map
};
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = (_ref2 = aliasBranch.Base, _ref2 === Object ? _Object$groupBy([], x => x) : _ref2.groupBy([], x => x));

// an ARRAY slot indexes a branching value like a keyed one does
const inElement = [c ? Object : String, 0];
export const viaElement = (_ref3 = inElement[0], _ref3 === String ? _String$raw({
  raw: ['x']
}) : _ref3.raw({
  raw: ['x']
}));

// a NESTED container descends to the branching slot
const nested = {
  inner: {
    Base: c ? Object : _Reflect
  }
};
export const viaNested = nested.inner.Base.ownKeys({});

// A bare alias exposes constructor candidates for an identity guard.
const aliasBase = c ? Object : Math;
export const viaBareAlias = (aliasBase === Math ? _Math$clz32 : aliasBase.clz32.bind(aliasBase))(1);