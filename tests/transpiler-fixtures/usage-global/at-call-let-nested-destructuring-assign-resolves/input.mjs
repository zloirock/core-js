let name;
({ a: { name } } = { a: { name: "alice" } });
name.at(-1);
