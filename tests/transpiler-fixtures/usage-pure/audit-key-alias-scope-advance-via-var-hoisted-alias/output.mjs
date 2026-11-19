import _Array$from from "@core-js/pure/actual/array/from";
// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
// a var-hoisted alias from a nested block resolves its init in the DECLARATOR's block - the
// later block shadow of the source name must not swap the key (both parsers must report the
// same declaration scope for the hoisted var)
export function viaVarHoistedAlias() {
  {
    var hoisted = j;
  }
  {
    const j = 'of';
    void j;
    return _Array$from([5]);
  }
}