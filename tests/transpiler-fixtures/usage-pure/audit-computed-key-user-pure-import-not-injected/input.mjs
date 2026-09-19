// The user's OWN deduped `@core-js/pure` import is a binding the user typed, NOT a reference the
// plugin placed - so using it as a computed key must not bail the sibling synth. A name-based
// identity check would over-bail here (the import shares the plugin's UID convention); node
// provenance does not, so the shorthand `of` is still mirrored (`= { [_Array$from]: ..., of: ... }`)
import _Array$from from '@core-js/pure/actual/array/from';

export function pick(cond) {
  const { [_Array$from]: own, of } = cond ? Array : Set;
  return [own, of([1])];
}
