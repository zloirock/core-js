// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = ((Array.from as any)<any>)([1]);
export const r = [viaCast];
