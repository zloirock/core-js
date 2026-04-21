// arrow body wrapper + static polyfill share range → mergeEqualRange path.
// polyfill binding name `_Array$from` contains `$` — function-form replace must pass it through
const f = x => Array.from(x).at(0);
