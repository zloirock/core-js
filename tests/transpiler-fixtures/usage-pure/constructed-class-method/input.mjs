// A class constructor can return an object outside its declared instance family.
// Reads from that replacement must retain instance polyfills.
class C { constructor() { return { value: [1,2,3] }; } value = "abc"; } new C().value.at(-1);
