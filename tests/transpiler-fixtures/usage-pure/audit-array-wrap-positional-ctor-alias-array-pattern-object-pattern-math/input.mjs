// a same-name redeclaration of STATICS-ONLY hints merges last-wins like the ctor form - the
// use folds through the last write's hint (runtime last-write-wins)
var [{ JSON: VR }] = [globalThis];
var [{ Math: VR }] = [globalThis];
