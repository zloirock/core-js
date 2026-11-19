// a proxy-global MEMBER arg resolves at the call site through the shadow too
export const viaMemberArg = !function ({ resolve }, Promise) { return resolve; } (globalThis.Promise);
