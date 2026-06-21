// `Object.freeze` / `Object.seal` are identity statics (returnsArgument: 0): the result
// keeps the argument's concrete container type. a chained multi-type method (includes / at,
// on Array AND String) narrows the array arg to Array (injects es.array.*, not generic
// 'Object' which would drop the polyfill on ie:11) and the string arg to String
// (es.string.*). preventExtensions / setPrototypeOf share the returnsArgument:0 path.
const a: number[] = [1, 2, 3];
const s: string = 'xyz';
Object.freeze(a).includes(2);
Object.seal(a).at(0);
Object.freeze(s).includes('y');
