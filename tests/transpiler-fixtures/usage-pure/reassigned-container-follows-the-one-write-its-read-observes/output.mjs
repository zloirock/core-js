import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// pure resolves a REASSIGNED container binding on proof: an unconditional write, nothing written after the
// read, is the ONE value the read can observe, so pure follows it - through a pattern, a member read, an
// array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern write or a
// `??=` over a binding still unset - and serves that value's static, never the init's
let rw1 = {
  k: Object
};
rw1 = {
  k: _Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = {
  k: {
    groupBy: _Map$groupBy
  }
};
let rw2 = {
  s: Object
};
rw2 = {
  s: Array
};
export const viaDominatingMember = _Array$from([1]);
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: _Promise
}];
const [{
  p: {
    race: _unused
  }
}] = rw5;
const viaWrapper = _Promise$race;
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return _Array$of.call(this, 1);
  }
}
export const viaExtends = R6.go();
class R7 {
  static M = Object;
}
R7 = {
  M: _Promise
};
const viaClassReassign = _Promise$withResolvers;
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: _Promise
});
const {
  d: {
    allSettled: viaSeWrite
  }
} = {
  d: {
    allSettled: _Promise$allSettled
  }
};
let wPL = {
  n: Object
};
({
  0: wPL
} = [{
  n: Number
}]);
const viaPatternObjLhs = _Number$isInteger;
let wNu;
wNu ??= {
  u: Object
};
const viaNullishBinding = _Object$getOwnPropertyNames;
export { viaDominating, viaWrapper, viaClassReassign, viaSeWrite, viaPatternObjLhs, viaNullishBinding };