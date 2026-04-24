// `var Map = Map` - self-referential hoisted var binding still resolves to the
// global `Map`. plugin emits the Map constructor polyfill and rewrites both the
// init and all subsequent references to the pure import
var Map = Map;
const m = new Map();
m.get('k');
