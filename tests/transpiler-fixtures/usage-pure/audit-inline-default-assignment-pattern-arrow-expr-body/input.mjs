// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const f = ({ from = [], ...rest } = Array) => [from, rest];
f();
