// A replaced invoker observes the original arguments. A known function parameter does not
// authorize synthesizing the values passed to the user replacement of Reflect.apply.
function read([{ from } = Array]) { return from; }
Reflect.apply = (fn, receiver, args) => args[0][0] === Array;
Reflect.apply(read, null, [[Array]]);
