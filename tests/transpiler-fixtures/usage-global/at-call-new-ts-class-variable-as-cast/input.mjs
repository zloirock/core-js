class MyArray extends Array {}
const Cls = MyArray as typeof MyArray;
new Cls().at(-1);
