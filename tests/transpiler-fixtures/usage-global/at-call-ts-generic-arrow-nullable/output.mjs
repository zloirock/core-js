import "core-js/modules/es.array.at";
const foo = <T,>(x: T): T | null => x;
foo([1, 2, 3]).at(-1);