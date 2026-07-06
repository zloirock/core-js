import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref3;
// parenthesized type slots outside the mapped family: utility-type args, index-signature
// key types, discriminant literals, alias-chain bodies, callback and callable annotations -
// each dispatch peels so both parsers agree
declare function f(): string[];
type R = ReturnType<(typeof f)>;
declare const ret: R;
_atMaybeArray(ret).call(ret, 0);
interface M { [k: (number)]: string[] }
declare const sig: M;
declare const s: string;
_includes(_ref = sig[s]).call(_ref, 'x');
type U = { kind: ('a'); v: number[] } | { kind: 'b'; v: string };
declare const disc: U;
if (disc.kind === 'a') { var _ref2; _atMaybeArray(_ref2 = disc.v).call(_ref2, 0); }
type Inner = (number[]);
type Outer = Inner;
declare const chained: Outer;
_includesMaybeArray(chained).call(chained, 4);
interface Api { each(cb: ((x: string[]) => void)): void }
declare const api: Api;
api.each(x => _atMaybeArray(x).call(x, 0));
declare const make: ((() => number[]));
_includesMaybeArray(_ref3 = make()).call(_ref3, 5);
type A = Awaited<(Promise<number[]>)>;
declare const awaited: A;
_atMaybeArray(awaited).call(awaited, 0);