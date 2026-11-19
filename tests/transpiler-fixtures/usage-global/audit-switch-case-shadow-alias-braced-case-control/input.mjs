export function bracedCaseControl(cond, mk) {
  let A = Array;
  switch (cond) {
    case 1: {
      let A = mk();
      A = mk();
    }
  }
  return A.of(2);
}
