import _Array$from from "@core-js/pure/actual/array/from";
// Outer and inner effectful keys run in order before the served from binding initializes.
function eff() {
  return Object;
}
{
  const {
      [(eff('k'), 'w')]: {}
    } = {
      w: Array
    },
    f = (eff('k2'), _Array$from);
}