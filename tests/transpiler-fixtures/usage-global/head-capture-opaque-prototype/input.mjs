// A constructor candidate beside an opaque value keeps the nested capture and static guard.
// The unknown prototype still needs generic dispatch after the claims move.
export function read(flag, unknown) {
  for (const R of [flag ? Array : unknown]) {
    const { prototype: { at, length }, fromAsync: from } = R;
    use(at, length, from);
  }
}
