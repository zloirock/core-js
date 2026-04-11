const { a: [b, ...c] } = { a: [1, "x", "y"] };
b.at(0);
c.includes("x");
