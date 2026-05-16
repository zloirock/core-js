// chained inheritance through qualified parents: `Child extends NS.Mid extends NS.Base`.
// `findClassMember` recurses through `resolveSuperClassPath` at each hop -- both hops
// must resolve the qualified shape for the return-type hint to propagate down to the
// leaf subclass. without the fix the first qualified hop returns null and inheritance
// chain breaks at Mid.
namespace NS {
  export class Base {
    static gather(x: string): string[] { return [x]; }
  }
  export class Mid extends Base {}
}
class Child extends NS.Mid {}
const arr = Child.gather('x');
arr.at(0);
