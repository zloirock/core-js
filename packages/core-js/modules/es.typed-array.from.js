'use strict';
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var ITERATOR_RESULT_WEBKIT_BUG = require('../internals/iterator-result-webkit-bug');
var exportTypedArrayStaticMethod = require('../internals/array-buffer-view-core').exportTypedArrayStaticMethod;
var typedArrayFrom = require('../internals/typed-array-from');

var FORCED = TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS || ITERATOR_RESULT_WEBKIT_BUG;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod('from', typedArrayFrom, FORCED);
