import _Object$keys from "@core-js/pure/actual/object/keys";
// ... and a pattern written further down the body reads the loop variable as a binding of its
// element: the static walk reads a for-of head's sole element as the init the head never had
for (const viaLater of [{
  w: Object
}]) {
  const z = 1;
  const viaLaterKeys = _Object$keys;
  [z, viaLaterKeys];
}