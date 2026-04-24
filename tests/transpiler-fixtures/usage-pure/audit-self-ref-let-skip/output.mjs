// `let X = X` is a runtime TDZ (ReferenceError) - unlike `var`, it doesn't hoist to
// `undefined`. `createSelfRefVarGuard` requires `kind === 'var'`, so let/const self-refs
// are deliberately NOT polyfilled. keep the user error surfacing intact
let Map = Map;
new Map();