// $justImport
import '@core-js/pure/full/array-buffer/detached';
// @ts-expect-error it has no exports
import detached from '@core-js/pure/full/array-buffer/detached';

// $prototype with generics
import at from '@core-js/pure/full/array/prototype/at';
at.call([1, 2, 3], -2); // we can't save strict result type for prototype methods with generics. It is any here
at.apply([1, 2, 3], [-2]);
// @ts-expect-error
at.call([1, 2, 3], null);
// @ts-expect-error
at.call(123);
// @ts-expect-error
at('string');
// @ts-expect-error
at(null);

// $prototype without generics
import stringAt from '@core-js/pure/full/string/prototype/at';
const stringAtResult: string | undefined = stringAt.call('asd', -2);
stringAt.apply('asd', [-2]);
// @ts-expect-error
stringAt.call('asd', null);
// @ts-expect-error
stringAt.call('asd');
// @ts-expect-error
stringAt([1]);
// @ts-expect-error
stringAt(null);

// $prototypeIterator
import arrayVirtualIterator from '@core-js/pure/full/array/prototype/iterator';
const aviValue1: number = arrayVirtualIterator.call([1]).next().value;
const aviResult1: IterableIterator<number> = arrayVirtualIterator.call([1, 2, 3]);
const aviResult2: IterableIterator<string> = arrayVirtualIterator.call(['a', 'b']);
const aviResult3: IterableIterator<boolean> = arrayVirtualIterator.call([true, false]);
// @ts-expect-error
arrayVirtualIterator(1);
// @ts-expect-error
arrayVirtualIterator.call([1, 2, 3], 1);

// $uncurried
import arrayAt from '@core-js/pure/full/array/at';
const arrayAtResult1: number | undefined = arrayAt([1, 2, 3], -2);
const arrayAtResult2: string | undefined = arrayAt(['a', 'b'], -2);
const arrayAtResult3: undefined = arrayAt([], 1);
// @ts-expect-error
arrayAt([1, 2], 'string');
// @ts-expect-error
arrayAt();
// @ts-expect-error
arrayAt(1, 0, 0);

// $uncurriedIterator
import arrayIterator from '@core-js/pure/full/array/iterator';
arrayIterator([]).next().value;
// @ts-expect-error
arrayIterator();

// $static
import arrayFrom from '@core-js/pure/full/array/from';
arrayFrom('qwe', it => it.toUpperCase(), {});
// @ts-expect-error
arrayFrom(1);
// @ts-expect-error
arrayFrom('qwe', 1);

// $staticWithContext
import allSettled from '@core-js/pure/full/promise/all-settled';
allSettled([1, 2, 3]);
// @ts-expect-error
allSettled(1);

// $patchableStatic
import stringify from '@core-js/pure/full/json/stringify';
stringify({ a: 1, b: 2, c: 'asd' }, (_key, val) => typeof val === 'number' ? val * 2 : val, 4);
// @ts-expect-error
stringify([1], 1);

// $namespace
import adsConstructor from '@core-js/pure/full/async-disposable-stack/constructor';
new adsConstructor();
// @ts-expect-error
adsConstructor.prototype = 1;

// $helper
import getIterator from '@core-js/pure/full/get-iterator';
getIterator([]).next().value;
// @ts-expect-error
getIterator();

// $path just typed arrays
// import errorConstructor from '@core-js/pure/full/error/constructor';
// new errorConstructor.Error('er');
// // @ts-expect-error
// errorConstructor();

// $instanceArray
import iConcat from '@core-js/pure/full/instance/concat';
iConcat({});
// @ts-expect-error
iConcat();

// $instanceString
import iCodePointAt from '@core-js/pure/full/instance/code-point-at';
iCodePointAt('').call('a', 0);
// @ts-expect-error
iCodePointAt();

// $instanceFunction
import iDemethodize from '@core-js/pure/full/instance/demethodize';
iDemethodize([].slice)([1, 2, 3], 1);
// @ts-expect-error
iDemethodize();

// $instanceDOMIterables
import iForEach from '@core-js/pure/full/instance/for-each';
iForEach({});
// @ts-expect-error
iForEach();

// $instanceArrayString
import iAt from '@core-js/pure/full/instance/at';
iAt('').call('123', 2);
// @ts-expect-error
iAt();

// $instanceArrayDOMIterables
import iEntries from '@core-js/pure/full/instance/entries';
iEntries([]).call([1, 2, 3]).next().value;
// @ts-expect-error
iEntries();

// $instanceRegExpFlags
import iFlags from '@core-js/pure/full/instance/flags';
iFlags(/./g);
// @ts-expect-error
iFlags();

// $proposal
import '@core-js/pure/proposals/accessible-object-hasownproperty';
