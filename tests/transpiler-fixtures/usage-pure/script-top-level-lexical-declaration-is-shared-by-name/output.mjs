var _Map = require("@core-js/pure/actual/map");
var _Promise = require("@core-js/pure/actual/promise");
var _Set = require("@core-js/pure/actual/set");
var _WeakMap = require("@core-js/pure/actual/weak-map/constructor");
var _WeakSet = require("@core-js/pure/actual/weak-set/constructor");
// a top-level `let`, `const` or `class` of a sloppy script that may run bare binds in the realm's shared lexical
// scope: another script reads it by name as it reads a top-level `var`, so a constructor it holds takes the whole
// entry. a `let` in a block or a loop head binds there and stays the file's own
let S = _Set;
const M = _Map;
class Q extends _Promise {}
{
  let W = _WeakMap;
  new W();
}
for (const X of [_WeakSet]) new X();