import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
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
export const result = Array.from([1]);