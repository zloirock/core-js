'use strict';
var TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var ITERATOR_RESULT_WEBKIT_BUG = require('../internals/iterator-result-webkit-bug');
var exportTypedArrayStatic = require('../internals/export-typed-array-static');
var typedArrayFrom = require('../internals/typed-array-from');

var FORCED = TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS || ITERATOR_RESULT_WEBKIT_BUG;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStatic('from', typedArrayFrom, FORCED);
