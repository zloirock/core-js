// A class constructor can return an object outside its declared instance family.
// The field stays unknown; this is a presence control for its instance-method polyfill.
// Reads from that replacement must retain instance polyfills.
class B { constructor() { return { value: [1,2,3] }; } } class C { value = "abc"; } Reflect.construct(B, [], C).value.at(-1);
