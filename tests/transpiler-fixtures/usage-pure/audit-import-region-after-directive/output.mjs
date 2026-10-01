// `'use strict'` directive followed by user `import` followed by user code.
// `var _ref;` placement must land after the user import (ESLint `import/first`
// convention), not between the directive and the user import
'use strict';

import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import { something } from './lib.js';
const arr = [something];
_atMaybeArray(arr).call(arr, -1);