const a = b;
const b = a;
const obj = { [a]: 'hello' };
obj[a].at(0);
