// multi-quasi template literals as computed keys: must fold when every interpolation is
// a literal (`fla${'t'}` -> 'flat'), bail when any interpolation is dynamic. plain
// instance call confirms unrelated polyfill dispatch is unaffected
const arr = [1, 2, 3];
const literalKey = arr[`fla${'t'}`];
literalKey;
const dynamicKey = arr[`pre${runtime}fix`];
dynamicKey;
arr.includes(1);
