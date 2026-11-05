// A for-of array head keeps its native static read and array-rest collection.
// Both a call-produced pair and a bound pair are consumed by the original head.
const pairing = () => [Math, 1];
for (const [{ imul: viaCallRest }, ...afterCall] of [pairing()]) use(viaCallRest(2, 3), afterCall);
const pair = [Math, 1];
for (const [{ cosh: viaAliasRest }, ...afterAlias] of [pair]) use(viaAliasRest(1), afterAlias);
