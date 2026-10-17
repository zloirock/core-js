import "core-js/modules/es.number.constructor";
// The discriminant always replaces D; its old Number candidate must not add a guard.
export function discriminantWrite(mk) {
  let D = Number;
  switch (D = mk()) {
    case 1:
      let D = 0;
      mk(D);
  }
  return D.parseFloat("1.5");
}