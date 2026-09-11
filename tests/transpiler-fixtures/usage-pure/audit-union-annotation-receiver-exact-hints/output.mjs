import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a cross-family union receiver dispatches through the generic runtime helper in pure
// (one import, receiver-dispatching) - the union hint set narrows the GLOBAL twin's
// import set, the pure output must stay the single generic helper
declare const r: number[] | string;
_includes(r).call(r, 'x');
declare const n: string[] | string | null;
_at(n).call(n, 0);