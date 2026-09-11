// an alias whose init reads a proxy-global off a receiver must resolve that receiver in the alias's
// OWN declaration scope, not the use site. an inner param that reuses the receiver name (a minifier
// staple) shadows it at the use site only - resolving there drops the injection, a missing polyfill
// on a target that needs it. every init shape (member, zero-arg IIFE, destructure-alias) is affected
var globalRef = globalThis;
function readMember(globalRef) { return memberAlias.groupBy([], (x) => x); }
var memberAlias = globalRef.Map;
function readIife(globalRef) { return iifeAlias.fromAsync([]); }
var iifeAlias = (() => globalRef.Array)();
function readDestructure(globalRef) { return destructureAlias.hasOwn({}, 'x'); }
var { Object: destructureAlias } = globalRef;
