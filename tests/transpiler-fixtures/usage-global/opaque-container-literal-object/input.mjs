// An unknown key selects an Object constructor; reading groupBy does not expose its namespace.
export function read(key) { return [Object][key].groupBy([1, 2], value => value % 2); }
