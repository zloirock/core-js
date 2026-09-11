// duplicate-key object literal: the later computed key with a statically-resolvable
// string wins per ECMA-262 13.2.5.5, so `obj.foo` is `stringFn` at runtime. the
// reverse-walk must consider computed-key properties (parity with the class side) so it
// does not stop at the earlier non-computed `arrayFn` and emit a wrong array-narrow polyfill.
declare function arrayFn(): number[];
declare function stringFn(): string;
const obj = { foo: arrayFn, ['foo']: stringFn };
obj.foo().at(-1);
