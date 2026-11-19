import _Array$from from "@core-js/pure/actual/array/from";
// A chain assignment writes its TAIL into every name on the chain, so a dominating `x = y = V` write installs `V` whatever channel
// later reads the alias - a bare receiver, a computed key, a callee, an array-wrapper alias, a class base or static container -
// and the static binds the ponyfill outright.

let recv = Object,
  r2;
recv = r2 = Array;
export const bareReceiver = _Array$from('ab');