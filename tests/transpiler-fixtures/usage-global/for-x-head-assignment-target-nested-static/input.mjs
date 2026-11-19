// a for-x HEAD that declares NOTHING still names what its pattern reads: a nested level under a
// static key is a read of that static, so the module is owed whether or not the head declares a
// binding. one constructor per line - the import set is the only observable here, and two lines
// sharing a family would mask each other
let viaOf, viaEntries, viaGroup;

for ({ of: { name: viaOf } } of [Array]) eff(viaOf);

for ({ fromEntries: { name: viaEntries } } of [Object]) eff(viaEntries);

for ({ groupBy: { name: viaGroup } } of [Map]) eff(viaGroup);

// The call runs once before the loop binds the nested static.
function make() { eff(); return Array; }
for ({ of: { name: via } } of [make()]) eff(via);
