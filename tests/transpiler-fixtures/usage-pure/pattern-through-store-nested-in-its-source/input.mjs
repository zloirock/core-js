// a pattern level reached through a STORE nested in the destructure source stays as written - pure
// would otherwise rewrite the container the store hands to `cache` - so the constructor the read
// lands on takes its whole entry. a store that is the source itself keeps the static named
let cache;
export const [[{ groupBy }]] = [(cache = [Map])];

let kept;
export const [{ allSettled }] = (kept = [Promise]);
