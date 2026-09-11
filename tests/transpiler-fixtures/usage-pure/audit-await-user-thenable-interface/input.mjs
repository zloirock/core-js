// interface-shaped Thenable (not class). same structural rule: `await x` peels to the
// callback's first-arg type per Thenable contract. T = number[] flows through to `arr`,
// narrow Array dispatch fires for both `.at(0)` and `.includes(1)`
interface MyThenable<T> {
  then(cb: (v: T) => any, e?: any): MyThenable<T>;
}
declare const t: MyThenable<number[]>;
async function go() {
  const arr = await t;
  arr.at(0);
  arr.includes(1);
}
go();
