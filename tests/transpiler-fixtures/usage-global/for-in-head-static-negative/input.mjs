// A for-in head overwrites its alias with string keys, which carry no fromAsync static.
// No escaping Array constructor may mask this negative with a namespace import.
let value = Object;
for (value in { a: 1 }) { break; }
value.fromAsync([4]);
