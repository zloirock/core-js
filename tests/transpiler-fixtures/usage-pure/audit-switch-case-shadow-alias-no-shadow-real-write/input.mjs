// boundaries: these writes target the OUTER binding and must keep bailing the resolution
export function noShadowRealWrite(cond, mk) {
  let Q = Promise;
  switch (cond) {
    case 1:
      Q = mk();
  }
  return Q.allSettled([1]);
}
