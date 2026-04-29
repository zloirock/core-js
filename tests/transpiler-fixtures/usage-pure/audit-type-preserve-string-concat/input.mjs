// String.prototype.concat возвращает string. final .padStart должен dispatch'ить
// string-narrowed полифил, не generic - type должен carry через intermediate binding
const s = String('a');
const concatenated = s.concat('b');
concatenated.padStart(5);
