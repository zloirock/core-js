// the usage-pure direction of the same rule, where getting it wrong SUBSTITUTES: a real Annex-B
// hoist makes the name the local function, so replacing it with a pure import ships a different
// value. a lexical rebind between the function and its var-scope owner blocks the hoist and the
// name stays the global, where the substitution is required. an identifier catch param is exempt
{ function Promise() {} }
var a = Promise.withResolvers;
try { null.x; } catch (Set) { { function Set() {} } }
var b = Set.prototype;
for (let Map of []) { function Map() {} }
var c = Map.groupBy;
switch (1) { case 1: let Object; { function Object() {} } }
var d = Object.groupBy;
try { null.x; } catch ({ Array }) { { function Array() {} } }
var e = Array.fromAsync;
module.exports = [a, b, c, d, e];
