// `Sub` shadows `items` with a non-array, but `super.items` reaches past the shadow to the
// lexical parent's typed slot via the home-object prototype, never the runtime receiver's. it
// is not a `this`-rooted read, so the shadow guard does not fire and the narrow stays precise
class Base {
  static items: number[] = [];
}
class Sub extends Base {
  static items: any = "shadowed";
  static viaSuper() { return super.items.at(0); }
}
Sub.viaSuper();
