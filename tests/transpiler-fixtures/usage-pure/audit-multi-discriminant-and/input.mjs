type Box =
  | { kind: 'a'; sub: 'A1'; data: string[] }
  | { kind: 'a'; sub: 'A2'; data: number[] }
  | { kind: 'b'; data: number };

function readFirst(box: Box) {
  if (box.kind === 'a' && box.sub === 'A1') {
    return box.data.at(0);
  }
  return null;
}
