// A write to the slot invalidates its original constructor.
const source = [Array];
const custom = () => 9;
source[0] = { from: custom, extra: 7 };
const [{ from, ...rest }] = source;
export const result = [from(), rest];
