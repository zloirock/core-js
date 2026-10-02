// A plain local binding with no initializer or writes holds undefined.
// Its computed static read must not import the whole constructor family.
let key;
use(Array[key]);