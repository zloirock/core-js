import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Symbol$keyFor from "@core-js/pure/actual/symbol/key-for";
// A destructure init whose `||` / `??` constructor LEFT always decides owes, once every property is
// extracted, its prefix and that left's effects alone: the right never runs, so it leaves with the value -
// in a bodyless slot, a sequence element and a loop header too. A left that may be falsy keeps both
// operands and the live right is mirrored.
function make() {
  log();
  return _Map;
}
let n = 0;
make();
const groupBy = _Map$groupBy;
n++;
const forKey = _Symbol$for;
let ownKeys;
n++;
ownKeys = _Reflect$ownKeys;
n++;
const withResolvers = _Promise$withResolvers;
let race, allSettled;
if (n >= 0) race = _Promise$race;
const tail = (allSettled = _Promise$allSettled, n);
let keyFor, reject;
n++;
keyFor = _Symbol$keyFor;
if (n >= 0) n++, reject = _Promise$reject;
if (n >= 0) {
  n++;
  var any = _Promise$any;
}
for (var attempt = (n++, _Promise$try);;) break;
const maybe = pick();
const {
  from
} = maybe || {
  from: _Array$from
};
export { groupBy, forKey, ownKeys, withResolvers, race, allSettled, tail, keyFor, reject, any, attempt, from, n };