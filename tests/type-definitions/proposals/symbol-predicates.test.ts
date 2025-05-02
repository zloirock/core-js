import 'core-js/full';

const rsymbol1: boolean = Symbol.isRegisteredSymbol(Symbol.for('foo'));
const rsymbol2: boolean = Symbol.isRegisteredSymbol(undefined);
const rsymbol3: boolean = Symbol.isRegisteredSymbol(Symbol('bar'));

const rsymbol4: boolean = Symbol.isWellKnownSymbol(Symbol.iterator);
const rsymbol5: boolean = Symbol.isWellKnownSymbol({});
const rsymbol6: boolean = Symbol.isWellKnownSymbol(Symbol('baz'));

declare const u: unknown;
Symbol.isRegisteredSymbol(u);
Symbol.isWellKnownSymbol(u);

// @ts-expect-error
Symbol.isRegisteredSymbol();
// @ts-expect-error
Symbol.isWellKnownSymbol();
