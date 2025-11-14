import isRegisteredSymbol from '@core-js/pure/full/symbol/is-registered-symbol';
import isWellKnownSymbol from '@core-js/pure/full/symbol/is-well-known-symbol';

const rsymbol1: boolean = isRegisteredSymbol(Symbol.for('foo'));
const rsymbol2: boolean = isRegisteredSymbol(undefined);
const rsymbol3: boolean = isRegisteredSymbol(Symbol('bar'));

const rsymbol4: boolean = isWellKnownSymbol(Symbol.iterator);
const rsymbol5: boolean = isWellKnownSymbol({});
const rsymbol6: boolean = isWellKnownSymbol(Symbol('baz'));

declare const u: unknown;
isRegisteredSymbol(u);
isWellKnownSymbol(u);

// @ts-expect-error
isRegisteredSymbol();
// @ts-expect-error
isWellKnownSymbol();
