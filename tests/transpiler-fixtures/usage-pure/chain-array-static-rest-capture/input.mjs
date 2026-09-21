// Both array patterns read the same captured container and exclude the static from rest.
let from, rest;
const source = [Array];
const held = ([{ from, ...rest }] = ([{ from, ...rest }] = source));
use(held === source, from([1]), rest);
