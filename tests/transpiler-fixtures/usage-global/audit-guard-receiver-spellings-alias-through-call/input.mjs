const aliasFactory = () => globalThis.self;
let k4;
export const aliasThroughCall = (k4 = aliasFactory())?.Reflect.ownKeys({ b: 2 });
