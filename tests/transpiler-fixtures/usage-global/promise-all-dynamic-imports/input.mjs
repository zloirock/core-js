const arr = [import("a"), import("b")];
Promise.all(arr).then(x => x);
