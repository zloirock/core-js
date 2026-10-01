// @flow
// typeof preserves explicit signature arguments, including those supplied through an alias.
function id<T>(x: T): T { return x; }
function read(fn: typeof id<string>) { return fn("abc").at(0); }
