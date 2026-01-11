import 'core-js/full';

Iterator.zip([[1, 2, 3], [4, 5, 6]]);
Iterator.zip([['a', 'b', 'c'], ['d', 'e', 'f']]);
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'shortest' });
Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
Iterator.zipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: 'shortest' });

// @ts-expect-error
Iterator.zip(true);
// @ts-expect-error
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'incorrect' });
// @ts-expect-error
Iterator.zipKeyed(42);
// @ts-expect-error
Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: 'bar' });
