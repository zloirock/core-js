// A class constructor can return an object outside its declared instance family.
// Reads from that replacement must retain instance polyfills.
class C { constructor() { return [1,2,3]; } } new C().at(-1);
