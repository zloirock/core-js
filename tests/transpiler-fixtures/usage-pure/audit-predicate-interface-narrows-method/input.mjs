// a method member of the target resolves its call return
interface M { make(): string }
function isM(o: unknown): o is M { return true; }
function gm(v: unknown) {
  if (isM(v)) {
    v.make().at(0);
    v.make().padStart(2);
  }
}
