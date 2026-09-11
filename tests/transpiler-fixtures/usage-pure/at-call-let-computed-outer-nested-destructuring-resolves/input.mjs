const key = 'a';
let name;
({ [key]: { name } } = { a: { name: 'alice' } });
name.at(-1);
