import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a value WRITTEN into a reassigned alias resolves in the frame the write stands in, never the read's:
// a `var` the writing function reassigns, a `var` hoisted out of a nested block - read directly or
// through a hop - and a name a parameter default writes past a later `var` of the same name each
// name what the write stored
let viaVar = _Set;
function writesVar() {
  var held = _Set;
  held = Array;
  viaVar = held;
}
writesVar();
(viaVar === Array ? _Array$from : viaVar.from.bind(viaVar))(list);
let viaBlock = _Set;
function writesBlock() {
  {
    var realm = _globalThis;
  }
  viaBlock = realm.Array;
}
writesBlock();
(viaBlock === Array ? _Array$of : viaBlock.of.bind(viaBlock))(1);
let viaHop = _Set;
function writesHop() {
  if (on) {
    var hop = _Set;
    hop = Array;
  }
  viaHop = hop;
}
writesHop();
use(() => (viaHop === Array ? _Array$fromAsync : viaHop.fromAsync.bind(viaHop))(list));
let source = _Promise;
let viaDefault = _Set;
function writesDefault(x = viaDefault = source) {
  var source = _Map;
  return x;
}
writesDefault();
(viaDefault === _Promise ? _Promise$try : viaDefault.try.bind(viaDefault))(fn);