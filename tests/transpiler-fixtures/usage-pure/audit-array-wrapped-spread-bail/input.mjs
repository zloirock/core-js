// a SPREAD before the consumed element (`[...head, globalThis]`) makes the destructured index runtime-
// dynamic - element 0 is `head[0]` when head is non-empty, the proxy only when head is empty. the
// array-wrapper descent can't statically resolve which element feeds the pattern, so it bails to native
// (no extraction, no mirror): `from` resolves exactly as the untransformed code. resolving past the
// spread to the proxy would extract at the WRONG slot and corrupt the real (head[0]) receiver
const userObj = { Array: { from: () => [] } };
const head = [userObj];
const [{ Array: { from } }] = [...head, globalThis];
typeof from;
