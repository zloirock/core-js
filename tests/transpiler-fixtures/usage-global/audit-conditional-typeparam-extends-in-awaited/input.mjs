// Awaited unwraps the branch selected by the instantiated right-hand type.
type Pick<T, U> = T extends U ? Promise<string> : Promise<number[]>;
declare function probe<T, U>(): Awaited<Pick<T, U>>;
const data = await probe<Array<number>, Array<string>>();
const text = await probe<Array<string>, Array<string>>();
data.at(0);
text.includes('x');
export {};
