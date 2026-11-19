interface IfaceThenable<T> {
  then(cb: (v: T) => any): IfaceThenable<T>;
}
async function ifaceProbe(b: IfaceThenable<string>) {
  (await b).includes('x');
}
ifaceProbe();
