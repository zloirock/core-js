class NS {
  static Items = class extends Array {};
}
function foo(x: InstanceType<typeof NS.Items>) {
  x.at(-1);
}
