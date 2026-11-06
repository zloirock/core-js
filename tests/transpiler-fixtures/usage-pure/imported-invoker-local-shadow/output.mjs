import _Array$from from "@core-js/pure/actual/array/from";
// A local function sharing a pure import's name is not the imported invoker.
import invoke from '@core-js/pure/actual/reflect/apply';
function pick(value) {
  return value;
}
{
  function invoke() {
    return {};
  }
  invoke(pick, null, [Array]).from = patched;
}
export const result = _Array$from([1]);