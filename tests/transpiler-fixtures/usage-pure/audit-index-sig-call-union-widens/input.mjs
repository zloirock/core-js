// a CALL through a union of index signatures must WIDEN to generic when any arm's return
// fails to resolve - dropping the arm would over-narrow the survivors into a wrong Maybe
// (the runtime value may be the unresolvable arm's, e.g. a string, and a Maybe-Array
// forwards it to a native method absent on old engines)
type Arrays = { [k: string]: () => number[]; };
type Opaque = { [k: string]: () => UndeclaredExternalT; };
declare const viaCall: Arrays | Opaque;
declare const k: string;
export const widened = (viaCall[k]() as any).includes(1);

// convergent arms keep the narrow; a nullable arm stays skippable (throws natively anyway)
type MoreArrays = { [k: string]: () => number[]; };
declare const conv: Arrays | MoreArrays;
export const kept = (conv[k]() as any).at(0);
type Nullish = { [k: string]: null; };
declare const nul: Arrays | Nullish;
export const skippable = (nul[k]() as any).at(1);
