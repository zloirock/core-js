// A simultaneous swap reads both old values before either store.
let a = [3], b = "ab";
[a, b] = [b, a];
[a, b] = [b, a];
a.at(0);
