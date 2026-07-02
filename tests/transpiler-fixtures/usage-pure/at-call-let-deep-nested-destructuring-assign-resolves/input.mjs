let c;
({ a: { b: { c } } } = { a: { b: { c: 'deep' } } });
c.at(-1);
