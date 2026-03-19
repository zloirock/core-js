import "core-js/modules/es.array.at";
type Items<T = number> = T[];
const x: Items<string> = ['a'];
x.at(0);