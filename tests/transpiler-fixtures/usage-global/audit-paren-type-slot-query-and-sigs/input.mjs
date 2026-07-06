// parenthesized type slots outside the mapped family: utility-type args, index-signature
// key types, discriminant literals, alias-chain bodies, callback and callable annotations -
// each dispatch peels so both parsers agree
declare function f(): string[];
type R = ReturnType<(typeof f)>;
declare const ret: R;
ret.at(0);
interface M { [k: (number)]: string[] }
declare const sig: M;
declare const s: string;
sig[s].includes('x');
type U = { kind: ('a'); v: number[] } | { kind: 'b'; v: string };
declare const disc: U;
if (disc.kind === 'a') disc.v.at(0);
type Inner = (number[]);
type Outer = Inner;
declare const chained: Outer;
chained.includes(4);
interface Api { each(cb: ((x: string[]) => void)): void }
declare const api: Api;
api.each(x => x.at(0));
declare const make: ((() => number[]));
make().includes(5);
type A = Awaited<(Promise<number[]>)>;
declare const awaited: A;
awaited.at(0);
