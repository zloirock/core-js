let a;
[, { a }] = ["skip", { a: [1, 2, 3] }];
a.at(-1);
