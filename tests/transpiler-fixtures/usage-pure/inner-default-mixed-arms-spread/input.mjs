const pick = () => undefined;
const once = ([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)];
const spreadArgs = [[pick()]];
export const spread = once(...spreadArgs);
