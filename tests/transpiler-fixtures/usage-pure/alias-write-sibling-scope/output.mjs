import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
// An escaping assignment follows its lexical binding and retains Map statics.
// A same-name write in a sibling function must not retain Promise.all or Promise.any.
function expose() {
  var a = {};
  a = _Map;
  hand(a);
}
function sibling() {
  var a = {};
  a = _Promise;
  void _nameMaybeFunction(a);
}