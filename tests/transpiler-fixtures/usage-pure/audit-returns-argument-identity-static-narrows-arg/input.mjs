// `Object.freeze` / `Object.seal` are identity statics (returnsArgument: 0): the result keeps the
// argument's concrete container type. A chained multi-type instance method (includes / at, present
// on Array AND String) therefore narrows to the ARRAY and injects es.array.*, not the registry's
// generic 'Object' result (which would drop the polyfill on ie:11). The string arg is the contrast:
// the same inference narrows it to String and injects es.string.* - the result is type-faithful, not
// a blanket array assumption. preventExtensions / setPrototypeOf share this returnsArgument:0 path.
const a: number[] = [1, 2, 3];
const s: string = 'xyz';
Object.freeze(a).includes(2);
Object.seal(a).at(0);
Object.freeze(s).includes('y');
