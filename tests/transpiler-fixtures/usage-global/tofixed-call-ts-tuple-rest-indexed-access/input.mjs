type MyTuple = [string, ...number[]];
declare const tuple: MyTuple;
const x: MyTuple[1] = tuple[1];
x.toFixed(2);
const y: MyTuple[0] = tuple[0];
y.bold();
