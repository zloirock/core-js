// interface extends through a three-segment namespace path with type args;
// substitution through the qualified parent reaches members
namespace NS {
  export namespace Inner {
    export interface Base<T> {
      items: T[];
    }
  }
}
interface Sub<T> extends NS.Inner.Base<T> {}
declare const s: Sub<number>;
s.items.includes(1);
s.items.flat();
