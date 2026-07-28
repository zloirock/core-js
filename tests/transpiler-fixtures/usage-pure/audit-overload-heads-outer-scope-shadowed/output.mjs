import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An overload set is a run of same-name declarations in one statement list. A nested declaration
// shadows an outer ambient head instead of overloading it, while a head with no shadowing
// declaration still drives the type query. An `export` wrapper sits between a head and its
// statement list without leaving it, so exported heads still overload their exported
// implementation - the third row reads the LAST head's return, not the implementation's own.
// The last row reads twice on purpose: losing the retarget widens the receiver, which shows up in
// the global import set as the iterator modules `find` then needs, and in the pure one as `at`
// falling back to the family-agnostic helper. Either read alone leaves one flavor blind.
declare function convert(input: number): number[];
declare function widen(input: number): number[];
export declare function exported(input: number): string;
export declare function exported(input: string): number[];
export function exported(input: any) {
  return input;
}
function shadowed(result: ReturnType<typeof convert>) {
  function convert(input: string) {
    return input;
  }
  return _atMaybeString(result).call(result, 0);
}
function retargeted(result: ReturnType<typeof widen>) {
  return _includesMaybeArray(result).call(result, 1);
}
function throughExportWrapper(result: ReturnType<typeof exported>) {
  _findMaybeArray(result).call(result, x => x);
  return _atMaybeArray(result).call(result, 0);
}