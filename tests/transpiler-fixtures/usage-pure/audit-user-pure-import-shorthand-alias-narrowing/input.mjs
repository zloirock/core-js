// user-imported `_Array$from` (matching the plugin's shorthand) must register as an
// Array.from alias, so the call's return narrows to Array. distinct downstream methods
// cover generic-vs-array (concat) and Array-only (flatMap, findIndex) dispatch
import _Array$from from '@core-js/pure/actual/array/from';
const xs = _Array$from('abc');
xs.concat([1]);
xs.flatMap(x => [x]);
xs.findIndex(x => x === 'a');
