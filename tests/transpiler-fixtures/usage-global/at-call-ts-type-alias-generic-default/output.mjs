import "core-js/modules/es.array.at";
type Items<T = string> = T[];
const x: Items = ['a'];
x.at(0);