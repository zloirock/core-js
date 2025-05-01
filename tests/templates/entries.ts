// $justImport
require('@core-js/pure/full/array-buffer/detached');
// @ts-expect-error it has no exports
import abd from '@core-js/pure/full/array-buffer/detached';

// $virtual
require('@core-js/pure/full/array/virtual/at').call([1, 2, 3], -2);
import at from '@core-js/pure/full/array/virtual/at';
at.call([1, 2, 3], -2);
// @ts-expect-error
at(null, 0);

// $virtualIterator
require('@core-js/pure/full/array/virtual/iterator').call([1]).next().value;
import avit from '@core-js/pure/full/array/virtual/iterator';
avit.call([1]).next().value;
// @ts-expect-error
avit(1);

// $prototype
require('@core-js/pure/full/array/at')([1, 2, 3], -2);
import aat from '@core-js/pure/full/array/at';
aat([1, 2, 3], -2);
// @ts-expect-error
aat(1, 0, 0);

// $prototypeIterator
require('@core-js/pure/full/array/iterator')([]).next().value;
import ait from '@core-js/pure/full/array/iterator';
ait([]).next().value;
// @ts-expect-error
ait();

// $static
require('@core-js/pure/full/array/from')('qwe');
import af from '@core-js/pure/full/array/from';
af('qwe', (it) => it.toUpperCase(), {});
// @ts-expect-error
af(1);
// @ts-expect-error
af('qwe', 1);

// $staticWithContext
require('@core-js/pure/full/promise/all-settled')([1, 2, 3]);
import pas from '@core-js/pure/full/promise/all-settled';
pas([1, 2, 3]);
// @ts-expect-error
pas(1);

// $patchableStatic
require('@core-js/pure/full/json/stringify')([1]);
import js from '@core-js/pure/full/json/stringify';
js({ a: 1, b: 2, c: 'asd'}, (_key, val) => typeof val === 'number' ? val * 2 : val, 4);
// @ts-expect-error
js([1], 1);

// $namespace
require('@core-js/pure/full/async-disposable-stack/constructor');
import adc from '@core-js/pure/full/async-disposable-stack/constructor';
new adc();
// @ts-expect-error
adc.prototype = 1;

// $helper
require('@core-js/pure/full/get-iterator')([]);
import it from '@core-js/pure/full/get-iterator';
it([]).next().value;
// @ts-expect-error
it();

// $path
new (require('@core-js/pure/full/error/constructor').Error)();
import ec from '@core-js/pure/full/error/constructor';
new ec.Error('er');
// @ts-expect-error
ec();

// $instanceArray
require('@core-js/pure/full/instance/concat')(1);
import ic from '@core-js/pure/full/instance/concat';
ic({});
// @ts-expect-error
ic();

// $instanceString
require('@core-js/pure/full/instance/code-point-at')('');
import icp from '@core-js/pure/full/instance/code-point-at';
icp('').call('a', 0);
// @ts-expect-error
icp();

// $instanceFunction
require('@core-js/pure/full/instance/demethodize')({});
import id from '@core-js/pure/full/instance/demethodize';
id([].slice)([1, 2, 3], 1);
// @ts-expect-error
id();

// $instanceDOMIterables
require('@core-js/pure/full/instance/for-each')({});
import ife from '@core-js/pure/full/instance/for-each';
ife({});
// @ts-expect-error
ife();

// $instanceArrayString
require('@core-js/pure/full/instance/at')('');
import ia from '@core-js/pure/full/instance/at';
ia('').call('123', 2);
// @ts-expect-error
ia();

// $instanceArrayDOMIterables
require('@core-js/pure/full/instance/entries')({});
import ie from '@core-js/pure/full/instance/entries';
ie([]).call([1, 2, 3]).next().value;
// @ts-expect-error
ie();

// $instanceRegExpFlags
require('@core-js/pure/full/instance/flags')({});
import inf from '@core-js/pure/full/instance/flags';
inf(/./g);
// @ts-expect-error
inf();

// $proposal
require('@core-js/pure/proposals/accessible-object-hasownproperty');
// @ts-expect-error it has no exports
import pahp from '@core-js/pure/proposals/accessible-object-hasownproperty';
