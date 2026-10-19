import _at from "@core-js/pure/actual/instance/at";
function eff(key) {
  return Object;
}
{
  // @ts-expect-error a computed key tsc refuses is the shape under test
  const {
      [(eff('k'), 'w' as string)]: _ref
    } = {
      w: src
    },
    a = _at(_ref);
}