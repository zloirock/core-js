const Config = class {
  key: string = '';
};
function foo(x: InstanceType<typeof Config>) {
  Object.freeze(x);
}
