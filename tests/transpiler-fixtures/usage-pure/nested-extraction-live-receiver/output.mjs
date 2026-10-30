import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A delayed receiver follows its rewritten child in every assignment host.
let method;
const rows = [4, 9];
method = _atMaybeArray((observe(), _Array$from([4, 9])));
if (enabled) method = _atMaybeArray((observe(), _Array$from([4, 9])));
before();
method = _atMaybeArray((observe(), _Array$from([4, 9])));
after();
method = _atMaybeArray(_flatMaybeArray(rows).call(rows));