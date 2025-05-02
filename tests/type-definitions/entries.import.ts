// $justImport
import '@core-js/pure/full/array-buffer/detached';
// @ts-expect-error it has no exports
import detached from '@core-js/pure/full/array-buffer/detached';

// $virtual
import at from '@core-js/pure/full/array/virtual/at';
at.call([1, 2, 3], -2);
at.apply([1, 2, 3], [-2]);
// @ts-expect-error
at.call([1, 2, 3], null);
// @ts-expect-error
at.call(-2);
// @ts-expect-error
at('string');
// @ts-expect-error
at(null, 0);

// $virtualIterator
import avit from '@core-js/pure/full/array/virtual/iterator';
avit.call([1]).next().value;
// @ts-expect-error
avit(1);

// $prototype
import aat from '@core-js/pure/full/array/at';
aat([1, 2, 3], -2);
// @ts-expect-error
aat(1, 0, 0);

// $prototypeIterator
import ait from '@core-js/pure/full/array/iterator';
ait([]).next().value;
// @ts-expect-error
ait();

// $static
import af from '@core-js/pure/full/array/from';
af('qwe', (it) => it.toUpperCase(), {});
// @ts-expect-error
af(1);
// @ts-expect-error
af('qwe', 1);

// $staticWithContext
import pas from '@core-js/pure/full/promise/all-settled';
pas([1, 2, 3]);
// @ts-expect-error
pas(1);

// $patchableStatic
import js from '@core-js/pure/full/json/stringify';
js({ a: 1, b: 2, c: 'asd'}, (_key, val) => typeof val === 'number' ? val * 2 : val, 4);
// @ts-expect-error
js([1], 1);

// $namespace
import adc from '@core-js/pure/full/async-disposable-stack/constructor';
new adc();
// @ts-expect-error
adc.prototype = 1;

// $helper
import it from '@core-js/pure/full/get-iterator';
it([]).next().value;
// @ts-expect-error
it();

// $path
import ec from '@core-js/pure/full/error/constructor';
new ec.Error('er');
// @ts-expect-error
ec();

// $instanceArray
import ic from '@core-js/pure/full/instance/concat';
ic({});
// @ts-expect-error
ic();

// $instanceString
import icp from '@core-js/pure/full/instance/code-point-at';
icp('').call('a', 0);
// @ts-expect-error
icp();

// $instanceFunction
import id from '@core-js/pure/full/instance/demethodize';
id([].slice)([1, 2, 3], 1);
// @ts-expect-error
id();

// $instanceDOMIterables
import ife from '@core-js/pure/full/instance/for-each';
ife({});
// @ts-expect-error
ife();

// $instanceArrayString
import ia from '@core-js/pure/full/instance/at';
ia('').call('123', 2);
// @ts-expect-error
ia();

// $instanceArrayDOMIterables
import ie from '@core-js/pure/full/instance/entries';
ie([]).call([1, 2, 3]).next().value;
// @ts-expect-error
ie();

// $instanceRegExpFlags
import inf from '@core-js/pure/full/instance/flags';
inf(/./g);
// @ts-expect-error
inf();

// $proposal
import '@core-js/pure/proposals/accessible-object-hasownproperty';
// @ts-expect-error it has no exports
import pahp from '@core-js/pure/proposals/accessible-object-hasownproperty';
