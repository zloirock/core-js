import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The receiver prefix precedes the hop read. A missing hop evaluates its live default
// once, and the supplied method prevents the leaf default from running.
const effects = [];
const source = {
  get data() {
    _pushMaybeArray(effects).call(effects, 'get');
    return undefined;
  }
};
const lead = (_pushMaybeArray(effects).call(effects, 'lead'), 1);
const {
  data: {
    at = (_pushMaybeArray(effects).call(effects, 'leaf-default'), null)
  } = (_pushMaybeArray(effects).call(effects, 'default'), {
    at: _atMaybeArray(_Array$from('ab'))
  })
} = (_pushMaybeArray(effects).call(effects, 'prefix'), source);
export { lead, at, effects };