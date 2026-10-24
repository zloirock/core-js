// distinct method per default-narrow form so each form owns its own import
const { items = [] } = config;
items.at(0);
const { foo: bar = [] } = obj;
bar.includes(1);
const [, b = []] = arr;
b.flat();
function fn({ list = [] } = {}) {
  list.findLast(Boolean);
}
fn();
