type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>,
};
async function aliasProbe(c: AliasThenable<Array<string>>) {
  (await c).includes('x');
}
aliasProbe();
