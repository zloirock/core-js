class Config {
  key: string = '';
}
function foo(x: InstanceType<typeof Config>) {
  Object.freeze(x);
}
