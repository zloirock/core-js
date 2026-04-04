const { items = [] } = config;
items.at(0);
const { foo: bar = [] } = obj;
bar.at(0);
const [, b = []] = arr;
b.at(0);
function fn({ list = [] } = {}) {
  list.at(0);
}
fn();
