// interface extending a 4-segment qualified name (NS.Mid.Inner.Base); namespace walker
// must traverse through every segment, не bail at intermediate hop
namespace NS {
  export namespace Mid {
    export namespace Inner {
      export interface Base {
        bag: number[];
      }
    }
  }
}
interface Sub extends NS.Mid.Inner.Base {}
declare const s: Sub;
s.bag.at(0);
s.bag.flat();
