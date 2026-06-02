// the class-super analogue of the qualified-parent heritage anchor: `class Sub extends NS.Base`
// where `Base extends Inner` references a bare sibling in NS. the super walk anchors at the parent
// class NodePath so `Inner` resolves against NS's body, making `o` array-typed: `.at` injects the
// array variant `es.array.at`, where an anchor-walk failure would also emit `es.string.at`
namespace NS {
  export class Inner extends Array<number> {}
  export class Base extends Inner {}
}
class Sub extends NS.Base {}
declare const o: Sub;
o.at(0);
