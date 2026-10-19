import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// accepted boundary: an unannotated class static field, read at the type level, is the type of the
// value it holds - a concrete value asserted to a wider union keeps its own family, while an annotated
// field is read as declared (such a field is annotated instead)
class Defaults {
  static query = '' as string | string[];
  static ids: number[] = [];
}
export function hasTerm(term: typeof Defaults.query, part: string) {
  return _includesMaybeString(term).call(term, part);
}
export function lastId(ids: typeof Defaults.ids) {
  return _atMaybeArray(ids).call(ids, -1);
}