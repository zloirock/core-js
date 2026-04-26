// nested destructure where filters are applied inside a static-method call: the
// filters/transforms must not break the polyfill rewrite.
const { Object: { defineProperty } } = globalThis;
defineProperty({}, 'x', { value: 42 });
