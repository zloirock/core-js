import _Object$assign from "@core-js/pure/actual/object/assign";
// ... including the patch that travels through an ALIAS of the container, which the escape census
// follows and a per-name walk of the calls alone would miss
enum Aliased {
  MAP = 'map'
}
const aliasOfEnum = Aliased;
_Object$assign(aliasOfEnum, {
  MAP: 'filter'
});