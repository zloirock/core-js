class Foo {}
const ref1 = Foo;
const ref2 = ref1;
Object.freeze(ref2);