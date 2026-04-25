import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// mixed declarator: `var fs = require('fs'), x = 1`. only one declarator is `require()`;
// the other is a literal. plugin's reorder-pass must still treat the row as part of the
// import header so plugin-emitted `var _ref;` doesn't land BEFORE this row (which would
// violate ESLint `import/first` and the documented `imports -> requires -> var _ref` layout)
var fs = require('fs'), x = 1;
_atMaybeArray(_ref = [1, 2, 3]).call(_ref, x);
console.log(fs);