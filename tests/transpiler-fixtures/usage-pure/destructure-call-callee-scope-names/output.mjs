import _Math$hypot from "@core-js/pure/actual/math/hypot";
// a name the CALLEE spells resolves in the callee's scope: a namesake at the call site cannot capture
// it, and a shadow in the callee's own scope is what its literal holds - that read stays native
const named = () => ({
  a: Math
});
{
  const Math = custom;
  const {
    a: viaCalleeScope
  } = named();
  use(_Math$hypot(3, 4));
}
{
  const Object = custom;
  var shadowed = () => ({
    a: Object
  });
}
const {
  a: viaShadow
} = shadowed();
export const fromShadow = viaShadow.hasOwn({}, 'k');