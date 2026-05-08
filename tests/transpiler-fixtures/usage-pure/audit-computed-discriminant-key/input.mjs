// computed discriminant access `box['kind']` must narrow the union exactly like the
// dot form `box.kind`. the static-string computed key is equivalent to a property
// access for narrowing purposes
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function pickFirst(box: Box) {
  if (box['kind'] === 'a') {
    return box.data.at(0);
  }
  return box.data;
}
