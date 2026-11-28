// function-type's own `<T>` typeParameters shadow the outer alias's T; outer subst must
// NOT capture inner-bound T inside the function signature's params and return slot
type Outer<T> = { run: <T>(x: T[]) => T[] };
declare const o: Outer<number>;
const r = o.run([1, 2, 3]);
r.at(0);

// The inner element can be a string even though the outer argument is an array.
declare const strings: Outer<number[]>;
strings.run(["abc"])[0].includes("b");
