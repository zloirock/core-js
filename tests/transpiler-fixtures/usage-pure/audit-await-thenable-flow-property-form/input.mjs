// @flow
// Flow spellings of a user-defined structural Thenable. The peel used to accept only the TS
// node names, so every Flow file fell straight through and `await` narrowed nothing. Each
// positive arm uses a distinct method so the narrow is attributable: Array -> es.array.at,
// string -> es.string.includes, Array -> es.array.includes. The last arm is the negative: a
// `then` that is not a function type is not a Thenable, so the receiver stays unknown: the
// global flavor over-injects both `at` families, the pure one falls back to generic `at`.
class ClassThenable<T> {
  then: (cb: (v: T) => any) => ClassThenable<T>;
}
interface IfaceThenable<T> {
  then(cb: (v: T) => any): IfaceThenable<T>;
}
type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>,
};
type NotThenable = {
  then: string,
};
async function classProbe(a: ClassThenable<Array<number>>) {
  (await a).at(-1);
}
async function ifaceProbe(b: IfaceThenable<string>) {
  (await b).includes('x');
}
async function aliasProbe(c: AliasThenable<Array<string>>) {
  (await c).includes('x');
}
async function bailProbe(d: NotThenable) {
  (await d).at(0);
}
classProbe();
ifaceProbe();
aliasProbe();
bailProbe();
