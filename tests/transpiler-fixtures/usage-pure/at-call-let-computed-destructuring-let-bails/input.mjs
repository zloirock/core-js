let key = 'name';
key = 'other';
let val;
({ [key]: val } = { name: 'alice' });
val.at(-1);
