// a closure-write recovered from a switch discriminant (with a case-level shadow of the
// same name) proves the binding is reassigned: the recovery must also clear the stale
// `.constant` verdict, or `typeof x` resolution reads the init and narrows to an array
// Maybe on the runtime string (ie:11)
export function viaRecoveredWrite(mk) {
  let x = [1, 2, 3];
  switch (mk(() => {
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    x = 'hello';
  })) {
    case 1: {
      let x = 0;
      mk(x);
    }
  }
  const y: typeof x = x;
  return y.at(0);
}
