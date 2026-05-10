// merged class+interface; the interface side extends a namespaced parent with type args
namespace NS {
  export interface Container<T> {
    queue: T[];
  }
}
declare class Holder<T> {}
interface Holder<T> extends NS.Container<T> {}
declare const h: Holder<number>;
h.queue.at(0);
h.queue.includes(1);
