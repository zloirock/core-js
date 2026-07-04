import _getIterator from "@core-js/pure/actual/get-iterator";
// a TS cast around a computed key is transparent for provenance: a cast STRING spelling of the
// well-known symbol stays a plain property read, while a cast real symbol reference keeps its
// iterator-method routing
const arr = [1, 2];
export const stringKey = arr[('Symbol.iterator') as string];
export const realKey = _getIterator(arr);