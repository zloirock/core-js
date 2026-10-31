// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function f({ from, ...rest } = globalThis.self.Array) { return [from, rest]; }
f();
