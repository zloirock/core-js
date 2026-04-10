const key = 'name';
let name;
({ [key]: name } = { name: 'alice' });
name.at(-1);
