'use strict';
var TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var exportTypedArrayStatic = require('../internals/export-typed-array-static');
var typedArrayFrom = require('../internals/typed-array-from');

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStatic('from', typedArrayFrom, TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS);
