// $justImport
require('@core-js/pure/full/array-buffer/detached');

// $prototype
require('@core-js/pure/full/array/prototype/at').call([1, 2, 3], -2);

// $prototypeIterator
require('@core-js/pure/full/array/prototype/iterator').call([1]).next().value;

// $uncurried
require('@core-js/pure/full/array/at')([1, 2, 3], -2);

// $uncurriedIterator
require('@core-js/pure/full/array/iterator')([]).next().value;

// $static
require('@core-js/pure/full/array/from')('qwe');

// $staticWithContext
require('@core-js/pure/full/promise/all-settled')([1, 2, 3]);

// $patchableStatic
require('@core-js/pure/full/json/stringify')([1]);

// $namespace
require('@core-js/pure/full/async-disposable-stack/constructor');

// $helper
require('@core-js/pure/full/get-iterator')([]);

// $path
new (require('@core-js/pure/full/error/constructor').Error)();

// $instanceArray
require('@core-js/pure/full/instance/concat')(1);

// $instanceString
require('@core-js/pure/full/instance/code-point-at')('');

// $instanceFunction
require('@core-js/pure/full/instance/demethodize')({});

// $instanceDOMIterables
require('@core-js/pure/full/instance/for-each')({});

// $instanceArrayString
require('@core-js/pure/full/instance/at')('');

// $instanceArrayDOMIterables
require('@core-js/pure/full/instance/entries')({});

// $instanceRegExpFlags
require('@core-js/pure/full/instance/flags')({});

// $proposal
require('@core-js/pure/proposals/accessible-object-hasownproperty');
