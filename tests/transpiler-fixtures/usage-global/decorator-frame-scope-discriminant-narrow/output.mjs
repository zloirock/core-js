import "core-js/modules/es.array.at";
// a PARAMETER decorator's body is reached by a walk of its own, and the scope it opens is a FRAME:
// the binding a name resolves to there carries neither a write list nor a scope of its own. the
// discriminant narrow below asks both of those about `u` before it can pick the array arm
type U = {
  kind: "a";
  v: number[];
} | {
  kind: "b";
  v: string;
};
declare function dec(x: any): any;
declare const mk: () => U;
class C {
  m(@dec(function () {
    const u = mk();
    if (u.kind === "a") {
      u.v.at(0);
    }
  })
  p: number) {}
}