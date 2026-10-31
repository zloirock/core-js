// switch-case discriminant narrow on `w.kind`. each case consequent narrows `w`
// to its branch (case 'a' -> data:string, case 'b' -> data:number[]). the
// `current.listKey === 'consequent'` gate keeps the case narrow scoped to body
// positions - a use sitting in a sibling case's TEST slot wouldn't see this
// narrow, because the case body runs only after the discriminator commits
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const w: Shape;
switch (w.kind) {
  case 'a':
    w.data.at(0);
    break;
  case 'b':
    w.data.at(0);
    break;
}
