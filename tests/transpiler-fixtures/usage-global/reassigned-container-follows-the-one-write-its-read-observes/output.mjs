import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a REASSIGNED container binding resolves like the bare binding-alias canon, lifted to every walk hop: a
// DOMINATING write kills the declared init, and its value walks the remaining path - a pattern, a member
// read, an array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern
// write, a `??=` over an unset binding - so each static loads for that value, never for the init
let rw1 = {
  k: Object
};
rw1 = {
  k: Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = rw1;
let rw2 = {
  s: Object
};
rw2 = {
  s: Array
};
export const viaDominatingMember = rw2.s.from([1]);
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: Promise
}];
const [{
  p: {
    race: viaWrapper
  }
}] = rw5;
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return super.of(1);
  }
}
export const viaExtends = R6.go();
class R7 {
  static M = Object;
}
R7 = {
  M: Promise
};
const {
  withResolvers: viaClassReassign
} = R7.M;
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: Promise
});
const {
  d: {
    allSettled: viaSeWrite
  }
} = rw9;
let wPL = {
  n: Object
};
({
  0: wPL
} = [{
  n: Number
}]);
const {
  n: {
    isInteger: viaPatternObjLhs
  }
} = wPL;
let wNu;
wNu ??= {
  u: Object
};
const {
  u: {
    getOwnPropertyNames: viaNullishBinding
  }
} = wNu;
export { viaDominating, viaWrapper, viaClassReassign, viaSeWrite, viaPatternObjLhs, viaNullishBinding };