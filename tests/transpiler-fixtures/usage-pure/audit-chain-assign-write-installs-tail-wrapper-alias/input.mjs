// A chain assignment makes the wrapper hold its latest array value.
// The native allSettled read keeps the Promise source supplied by that write.
let wrap = [Object], w2;
wrap = w2 = [Promise];
const [{ allSettled }] = wrap;
export const wrapperAlias = allSettled.call(Promise, []);
