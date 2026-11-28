namespace NS1 { export function fn(x) { return [1, 2, 3]; } }
type T1 = ReturnType<typeof NS1.fn>;
declare const v1: T1;
v1.at(0);
