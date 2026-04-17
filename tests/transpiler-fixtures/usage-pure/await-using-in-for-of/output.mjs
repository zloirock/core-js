import _at from "@core-js/pure/actual/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
async function consume(sources) {
  for await (using resource of sources) {
    var _ref;
    _at(_ref = resource.handles).call(_ref, -1);
  }
  return _Array$from(sources);
}