const rcooked1: string = String.cooked('foo', 1, 2, 3);
String.cooked(['foo', 'bar'], 1, 2);
String.cooked([]);

// @ts-expect-error
String.cooked([null]);
// @ts-expect-error
String.cooked([undefined]);
