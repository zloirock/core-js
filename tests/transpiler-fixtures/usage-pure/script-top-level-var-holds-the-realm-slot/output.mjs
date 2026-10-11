var _Iterator = require("@core-js/pure/actual/iterator");
var _Map = require("@core-js/pure/actual/map");
var _Promise = require("@core-js/pure/actual/promise");
var _self = require("@core-js/pure/actual/self");
var _Set = require("@core-js/pure/actual/set");
var _Symbol = require("@core-js/pure/actual/symbol");
var _WeakMap = require("@core-js/pure/actual/weak-map/constructor");
// a sloppy script spelling no CommonJS may run bare, its top level the realm itself: a top-level `var` or function
// declaration is then the global object's own slot. what it holds leaves the file as an undeclared name's value
// does, and a constructor it holds takes the whole entry, whether the `var` is initialized with it, written later,
// spelled in a block or bound by a pattern, or a function returns it. a `var` inside a function stays its own
var Promise = _Promise;
var M;
M = _Map;
if (_self.flag) {
  var S = _Set;
}
var Y = _Symbol;
function iteratorCtor() {
  return _Iterator;
}
function local() {
  var W = _WeakMap;
  return new W();
}
local();