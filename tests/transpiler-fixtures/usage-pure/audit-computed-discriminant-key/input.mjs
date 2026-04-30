type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function pickFirst(box: Box) {
  if (box['kind'] === 'a') {
    return box.data.at(0);
  }
  return box.data;
}
