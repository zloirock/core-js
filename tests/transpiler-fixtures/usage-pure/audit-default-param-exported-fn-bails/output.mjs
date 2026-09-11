import _at from "@core-js/pure/actual/instance/at";
// an exported function's external callers live in other modules, so a defaulted param can never be
// proven un-overridden - the binding must stay generic regardless of in-file call sites. exercises the
// exported-NFE path: the outer (exported) binding name gates the bail, not the internal expression name.
export const make = function build(x = [1, 2]) {
  return _at(x).call(x, 0);
};
make();