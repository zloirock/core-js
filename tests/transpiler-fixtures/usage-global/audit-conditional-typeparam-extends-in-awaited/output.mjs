import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Awaited unwraps the branch selected by the instantiated right-hand type.
type Pick<T, U> = T extends U ? Promise<string> : Promise<number[]>;
declare function probe<T, U>(): Awaited<Pick<T, U>>;
const data = await probe<Array<number>, Array<string>>();
const text = await probe<Array<string>, Array<string>>();
data.at(0);
text.includes('x');
export {};