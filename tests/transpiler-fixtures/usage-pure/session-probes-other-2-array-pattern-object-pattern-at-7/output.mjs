import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
function eff2() {}
{
  const [_ref] = [{
    w: arr
  }, eff2()];
  const m = _atMaybeArray(_ref.w);
  use(m);
}