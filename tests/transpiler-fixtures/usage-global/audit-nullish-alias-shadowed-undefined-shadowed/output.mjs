import "core-js/modules/es.array.at";
// An alias whose reachable values are all nullish dispatches nothing, so the typeless instance row is suppressed.
export function shadowed() {
  let undefined = [1];
  let alias = null;
  alias ||= undefined;
  return alias.at(0);
}