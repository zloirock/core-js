// a TS `import x = require('<pure>/...')` alias is the plugin's own import binding like the ESM
// default import and the `var` require are: the name reads as that entry, and a read through the
// alias is left to the pass that spelled it - both legs alike. the twin bound to a plain library
// stays a user value and the instance read on it dispatches as usual
import _Array$from = require('@core-js/pure/actual/array/from');
import other = require('some-lib');
export const r = _Array$from([1, 2]).at(0);
export const q = other([3]).at(0);
// the export wrapper / modifier changes nothing about the binding: an exported alias is the
// plugin's own too, on the TS spelling and on the require var alike
export import _Array$of = require('@core-js/pure/actual/array/of');
export const _Array$at = require('@core-js/pure/actual/array/at');
export const s = _Array$of(1, 2).at(0);
export const t = _Array$at([1], 0).at(0);
