// Defaults resolve where parameters are declared, even when Array is shadowed at a caller.
// An earlier parameter named Array supplies a local default instead of a global static.
function read([{ from } = Array]) { return from; }
function caller(Array) { return [read([]), read([Array])]; }
function parameter(Array, [{ of } = Array]) { return of; }
function ownFrom(value) { return value; }
function ownOf(value) { return value; }
caller({ from: ownFrom });
parameter({ of: ownOf }, []);
parameter({ of: ownOf }, [undefined]);
