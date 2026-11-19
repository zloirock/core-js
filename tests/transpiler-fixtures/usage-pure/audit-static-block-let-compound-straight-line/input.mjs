// let declared inside a class static block with a compound-assign overwrite.
// StaticBlock has body as an array of statements just like Program; resolver
// must classify both the same way.
class C {
  static {
    let x = "";
    x += "hi";
    x.at(0);
  }
}
