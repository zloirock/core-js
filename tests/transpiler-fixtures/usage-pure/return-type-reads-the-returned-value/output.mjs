import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// accepted boundary: an unannotated function's return, read at the type level, is the type of the
// value it returns - an assertion over an untyped value is honoured, while a concrete value asserted
// to a wider union keeps its own family (such a return type is annotated instead)
function readTerm() {
  return '' as string | string[];
}
export function hasTerm(term: ReturnType<typeof readTerm>, part: string) {
  return _includesMaybeString(term).call(term, part);
}
function parseIds(raw: string) {
  return JSON.parse(raw) as number[];
}
export function lastId(ids: ReturnType<typeof parseIds>) {
  return _atMaybeArray(ids).call(ids, -1);
}