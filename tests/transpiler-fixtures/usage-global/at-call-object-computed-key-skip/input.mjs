const items = Symbol();
const obj = { items: 'hello', [items]: ['a', 'b'] };
obj.items.at(0);
