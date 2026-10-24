// a cross-family union receiver dispatches through the generic runtime helper in pure
// (one import, receiver-dispatching) - the union hint set narrows the GLOBAL twin's
// import set, the pure output must stay the single generic helper
declare const r: number[] | string;
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
r.includes('x');
declare const n: string[] | string | null;
n.at(0);
