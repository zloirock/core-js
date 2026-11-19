import _Array$from from "@core-js/pure/actual/array/from";
// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
const k = j;
// a BLOCK shadow of the source name holding a DIFFERENT valid key must not swap the resolved
// method: the alias binds the OUTER 'from', so the dispatch stays Array.from, never Array.of
export function viaBlockShadowedSource() {
  {
    const j = 'of';
    void j;
    return _Array$from([4]);
  }
}