declare function merge<A, B>(a: A, b: B): A & B;
merge({ x: 1 }, { y: 2 }).toString();
