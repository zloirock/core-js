const forIn = globalThis.cond ? Map : Object;
export const viaIn = 'groupBy' in forIn;
