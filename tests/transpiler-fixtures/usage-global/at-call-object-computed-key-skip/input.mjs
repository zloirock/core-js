// computed property key with a Symbol literal key prevents static lookup of `obj.items` shape;
// the surrounding `Symbol()` call still triggers symbol constructor + description polyfills
const items = Symbol();
const obj = { items: 'hello', [items]: ['a', 'b'] };
obj.items.at(0);
