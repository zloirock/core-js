import "core-js/modules/es.string.at";
// a string exclude is raw regex source, as documented: the escaped dots name `es.array.at` and
// nothing else, so the string read stays polyfilled. the escaped spelling was once read as an
// entry path and refused with "only allowed with method: 'usage-pure'"
[1].at(0);
'str'.at(-1);