import 'core-js/full';
import '@core-js/types';

const rcooked1: string = String.cooked('foo', 1, 2, 3);
String.cooked(['foo', 'bar'], 1, 2);
String.cooked([]);

// @ts-expect-error
String.cooked(1);
// @ts-expect-error
String.cooked(false);
