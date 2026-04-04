import "core-js/modules/es.array.at";
class NS {
  static Items = class extends Array {};
}
function foo(x: InstanceType<typeof NS.Items>) {
  x.at(-1);
}