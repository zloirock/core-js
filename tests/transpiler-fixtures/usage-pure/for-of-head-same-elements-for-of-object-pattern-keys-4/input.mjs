// ... and a pattern written further down the body reads the loop variable as a binding of its
// element: the static walk reads a for-of head's sole element as the init the head never had
for (const viaLater of [{ w: Object }]) { const z = 1; const { w: { keys: viaLaterKeys } } = viaLater; [z, viaLaterKeys]; }
