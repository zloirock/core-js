import 'core-js/full';
import isRegisteredSymbol from 'core-js/full/symbol/is-registered-symbol';
import isWellKnownSymbol from 'core-js/full/symbol/is-well-known-symbol';
import $Symbol from 'core-js/full/symbol';
import { assertBool } from '../../helpers.js';

assertBool(isRegisteredSymbol($Symbol.for('foo')));
assertBool(isWellKnownSymbol($Symbol.iterator));
assertBool($Symbol.isRegisteredSymbol($Symbol.for('foo')));
assertBool($Symbol.isWellKnownSymbol($Symbol.iterator));

assertBool(Symbol.isRegisteredSymbol(Symbol.for('foo')));
assertBool(Symbol.isRegisteredSymbol(undefined));
assertBool(Symbol.isRegisteredSymbol(Symbol('bar')));

assertBool(Symbol.isWellKnownSymbol(Symbol.iterator));
assertBool(Symbol.isWellKnownSymbol({}));
assertBool(Symbol.isWellKnownSymbol(Symbol('baz')));

declare const u: unknown;
Symbol.isRegisteredSymbol(u);
Symbol.isWellKnownSymbol(u);

// @ts-expect-error
isRegisteredSymbol();
// @ts-expect-error
$Symbol.isRegisteredSymbol();
// @ts-expect-error
isWellKnownSymbol();
// @ts-expect-error
$Symbol.isWellKnownSymbol();
// @ts-expect-error
Symbol.isRegisteredSymbol();
// @ts-expect-error
Symbol.isWellKnownSymbol();
