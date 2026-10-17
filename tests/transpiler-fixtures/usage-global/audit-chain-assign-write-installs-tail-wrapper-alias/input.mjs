let wrap = [Object], w2;
wrap = w2 = [Promise];
const [{ allSettled }] = wrap;
export const wrapperAlias = allSettled.call(Promise, []);
