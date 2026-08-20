// namespace with overload signatures plus an implementation body. TypeScript
// resolves ReturnType<typeof NS.fn> against the LAST DECLARED overload, not the
// implementation signature. the lookup must restrict to TSDeclareFunction headers
// so the runtime FunctionDeclaration body doesn't demote the canonical return type
// to its implementation `any`.
namespace NS {
  export function fn(x: string): string;
  export function fn(x: number): number[];
  export function fn(x: any): any { return null; }
}
type R = ReturnType<typeof NS.fn>;
declare const r: R;
r.at(0);
