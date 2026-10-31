// A computed class key reads the enclosing function's supplied receiver.
// It must retain the supplied constructor's static methods.
function read() { return Object.keys(new class { [typeof this.groupBy] = 1; })[0]; }
consume(Reflect.apply(read, Map, []));
