// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
// A statement-scope destructure keeps the receiver call once before its nested static binds.
// The remaining properties are copied afterward, excluding the consumed outer Array key.
declare const logCall: () => any;
const { Array: { from }, ...rest } = (logCall(), globalThis);
console.log(from, rest);
