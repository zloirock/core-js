import "core-js/modules/es.array.at";
const ns = {
  Items: class extends Array {}
};
function foo(x: InstanceType<typeof ns.Items>) {
  x.at(-1);
}