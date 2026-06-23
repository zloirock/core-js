// `new C()` on a value typed with a construct signature (`{ new (): T }`, or a constructable
// interface) narrows on the constructed instance - the `new`-context mirror of how a call
// signature narrows a call. crucially the two contexts use DIFFERENT signatures: `new` on a
// call-ONLY type does NOT borrow the call return, so it stays unresolved (the last line keeps
// its native `.flat`, no polyfill injected). distinct methods trace each line.
type Make<T> = { new (): T[] };

declare const makeArray: Make<string>;
export const a = new makeArray().at(0);

interface MakeString { new (): string }
declare const makeString: MakeString;
export const b = new makeString().includes("x");

type CallOnly = { (): number[] };
declare const callOnly: CallOnly;
export const c = new callOnly().flat();
