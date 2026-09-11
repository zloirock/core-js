// BigUint64Array constructor reference triggers the typed-array/methods cascade
// without injecting a (non-existent) constructor module.
new BigUint64Array(arr);
