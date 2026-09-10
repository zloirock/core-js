// `var X = X` names no global in any host a pass of ours emits for: the declaration binds afresh -
// the sloppy host is a CommonJS wrapper, whose top level is a function body - and the initializer
// reads the name's own hoisted `undefined`. so nothing substitutes, and every spelling of the shape
// answers alike: a `new` on the shadowed name, a PROTOTYPE member, a parenthesised init one parser
// keeps as a node and the other drops, and two STATICS that used to route through the member channel
// while the declaration itself stayed put - the identifier lane and the member lane read one source
// as one host. the last row is the control, a name the file never shadows
var Map = Map;
const m = new Map();
Map.prototype.get;
Map.groupBy([1], x => x);
var Promise = (Promise);
Promise.resolve(1);
var Symbol = Symbol;
Symbol.iterator in obj;
const control = Set;
