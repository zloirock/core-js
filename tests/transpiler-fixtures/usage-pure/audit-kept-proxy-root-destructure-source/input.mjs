// Instance destructuring keeps effectful realm receivers, stores and native fallback selection.
let c4 = 0;
let ds;
export const { copyWithin: copyWithinKept } = ((ds = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};
let mapOfKept;
let asg;
({ map: mapOfKept } = ((asg = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {});
let nst;
export const { flat: flatNested, constructor: { length: ctorLength } = {} } = ((nst = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};
export { c4, mapOfKept };
