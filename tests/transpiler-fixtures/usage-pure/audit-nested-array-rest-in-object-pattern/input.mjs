const { a: [, ...rest] } = { a: [1, "hello", "world"] };
rest.at(-1);
