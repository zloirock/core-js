// `typeof NS.Inner.fn` - a 3+ segment qualified name through nested TS namespaces. The
// nested namespace bodies are searched to find `fn`, whose return type is string[], so the
// result narrows to Array and `.at(0)` emits the Array variant.
namespace NS {
  export namespace Inner {
    export declare function fn(): string[];
  }
}
type R = ReturnType<typeof NS.Inner.fn>;
declare const r: R;
r.at(0);
