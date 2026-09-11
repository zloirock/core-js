// interface extends namespaced base with type args; substitution must reach members
namespace NS {
  export interface Base<T> {
    items: T[];
  }
}
interface Sub<T> extends NS.Base<T> {}
declare const s: Sub<string>;
s.items.includes('a');
