// TSInstantiationExpression wraps a runtime identifier: the polyfill must still recognize
// the identifier inside. Use `(Array<number>).from(x)` per parser restriction.
const f = (Array<number>).from([1, 2]);
const m = new (Map<string, number>)();
