// The type argument on the right is concrete at the call site.
type Cond<T, U> = T extends U ? string : number[];
declare function probe<T, U>(): Cond<T, U>;
probe<Array<number>, Array<string>>().at(0);
probe<Array<string>, Array<string>>().includes('x');
export {};
