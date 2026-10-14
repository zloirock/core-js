// a kept store over an effect-keyed proxy chain as a destructure SOURCE: the extraction claims the
// pattern and renders the source as written, so the hop collapse still runs on it - the dropped
// `self` hop's key folds into the next key, which runs once. the assignment form takes the same
// rule, and a nested level beside the claim reads the same collapsed source once.
let c4 = 0;
let ds;
export const { copyWithin: copyWithinKept } = ((ds = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};
let mapOfKept;
let asg;
({ map: mapOfKept } = ((asg = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {});
let nst;
export const { flat: flatNested, constructor: { length: ctorLength } = {} } = ((nst = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};
export { c4, mapOfKept };
