// Type declared and used inside a doubly-nested namespace. lookup-path walk reaches the
// innermost TSModuleBlock first and finds the decl there - confirms the walk doesn't
// skip the closest enclosing namespace when the decl is local.
namespace A {
  namespace B {
    type LocalArr = number[];
    declare const x: LocalArr;
    x.at(0);
  }
}
