// a parenthesized `Reflect.construct` is the same static, so what it builds is an instance of the class
// it names and a method call on it is typed by that class - also on the ESTree parser, where the
// parentheses are a node
class C {
  rows() { return [1]; }
}
export const result = (Reflect.construct)(C, []).rows().at(0);
