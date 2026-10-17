import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
function eff() {
  return Object;
}
{
  const [, _ref] = [eff(), {
    y: arr
  }];
  const ci = _atMaybeArray(_ref.y);
  use(ci);
}