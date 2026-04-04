import "core-js/modules/es.array.at";
class MyArray extends Array {}
const Cls = MyArray as typeof MyArray;
new Cls().at(-1);