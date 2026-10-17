// for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const { Math: { floor: viaForInitAnchor } } = (globalThis.window?.self); f2 < 1; f2++) { void viaForInitAnchor; }
export { f2 };
