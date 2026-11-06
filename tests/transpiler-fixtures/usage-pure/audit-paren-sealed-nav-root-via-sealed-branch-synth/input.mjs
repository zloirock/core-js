let cond1 = true;
export function viaSealedBranchSynth({ assign: sb1 } = cond1 ? (globalThis.window?.self.window).Object : Object) { return sb1; }
