// a value WRITTEN into a reassigned alias resolves in the frame the write stands in, never the read's:
// a `var` the writing function reassigns, a `var` hoisted out of a nested block - read directly or
// through a hop - and a name a parameter default writes past a later `var` of the same name each
// name what the write stored
let viaVar = Set;
function writesVar() { var held = Set; held = Array; viaVar = held; }
writesVar();
viaVar.from(list);
let viaBlock = Set;
function writesBlock() { { var realm = globalThis; } viaBlock = realm.Array; }
writesBlock();
viaBlock.of(1);
let viaHop = Set;
function writesHop() { if (on) { var hop = Set; hop = Array; } viaHop = hop; }
writesHop();
use(() => viaHop.fromAsync(list));
let source = Promise;
let viaDefault = Set;
function writesDefault(x = (viaDefault = source)) { var source = Map; return x; }
writesDefault();
viaDefault.try(fn);
