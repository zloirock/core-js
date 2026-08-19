// the receiver of an INSTANCE dispatch is memoized, and the memo is where the nav's collapse has to
// land: every row below reads (or deletes) a member off a proxy nav whose value the guard tests. the
// two legs anchor that guard by their own walks, so the rows fix WHICH `?.` owns the test
let w, n = 0;

// a KEPT chain-assign forces the probe read to stay (the user's variable must get what the source
// stored). the hop above it is read PLAIN, so its evaluation THROWS off-window - the guard may not
// slide down onto the probe value, which would answer `void 0` where the source throws
export const keptAssignPlainHop = ((w = globalThis.window)).self?.Array?.prototype.flat.name;
export const keptAssignDelete = delete ((w = globalThis.window)).self?.Array?.prototype.flat.name;

// no probe at all: every hop resolves, so the whole nav collapses onto the root ponyfill and the
// memo holds the collapsed receiver
export const resolvingNav = globalThis.self?.Array?.prototype.flat.name;

// a DEEP probe (`window` below a resolvable `self`): the nav collapses onto the hop's ponyfill and
// keeps the probe read plus its live `?.` - the memo is that value, not the raw source
export const deepProbeNav = globalThis.self.window?.Array?.prototype.flat;

// the delete consumer collapses the navigation whole, through a SEQUENCE root and through the
// guard scaffold this emit builds for the memo itself
export const seqDelete = delete ((n++, globalThis.window)).self?.Array?.prototype;
export const seqDeleteComputedKey = delete ((n++, globalThis.window)).self?.Array?.[(n++, 'of')];
export const loweredScaffoldDelete = delete ((globalThis.window?.self)?.Array?.prototype.flat.name);
export { w, n };

// the deleted member sits ABOVE an instance dispatch, so the members below it keep their claims and
// the collapse stops there. taking the whole span instead swallowed the dispatch (the queue aborts
// with no slot for its rewrite), and the receiver render handed its lifted `?.` into the helper
// argument, where it is a dangling token the bundler cannot parse
globalThis.box = { list: [[1]] };
export const deleteAboveDispatch = delete globalThis.self.box.list.at.name;
export const deleteAboveDispatchProbe = delete globalThis.window?.self.box.list.at.name;
export const deleteAboveDispatchPlainTail = delete globalThis.window?.self.box.list.at.customUserKey;
