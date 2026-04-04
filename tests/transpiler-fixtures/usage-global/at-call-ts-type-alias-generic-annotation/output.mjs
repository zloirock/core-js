import "core-js/modules/es.array.at";
type MyArray<T> = Array<T>;
const x: MyArray<string> = ['hello'];
x.at(-1).toFixed(2);