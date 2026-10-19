import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// accepted boundary: an unannotated function's return, read at the type level, is the type of the
// value it returns - an assertion over an untyped value is honoured, while a concrete value asserted
// to a wider union keeps its own family (such a return type is annotated instead)
function readTerm() {
  return '' as string | string[];
}
export function hasTerm(term: ReturnType<typeof readTerm>, part: string) {
  return term.includes(part);
}
function parseIds(raw: string) {
  return JSON.parse(raw) as number[];
}
export function lastId(ids: ReturnType<typeof parseIds>) {
  return ids.at(-1);
}