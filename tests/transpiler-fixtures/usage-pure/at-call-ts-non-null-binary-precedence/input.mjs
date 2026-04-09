declare const arr: { foo: { bar: number[] } };
const x = arr?.foo.bar.at(0)! + 5;
