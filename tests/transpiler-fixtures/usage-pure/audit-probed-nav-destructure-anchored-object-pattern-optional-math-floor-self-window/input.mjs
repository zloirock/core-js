// A for-init retains the live probe's guard and the native static's pattern.
// The computed key runs through the trailing sink at its original evaluation point.
let f2 = 0;
for (const { Math: { floor: viaForInitAnchor } } = (globalThis.window?.self); f2 < 1; f2++) { void viaForInitAnchor; }
export { f2 };
