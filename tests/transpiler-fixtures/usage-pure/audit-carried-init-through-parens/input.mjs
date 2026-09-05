// a carried init read THROUGH the parens a source may spell around it: they are ERASED at runtime,
// so what they hold performs exactly the effects they do - and the leg whose parser KEEPS the node
// must not answer differently from the one that drops it
const arr = [3, [1, 2]];
const hb = { get y() { return [3, [1, 2]]; } };
const { y: { at: viaParenSlot } } = { y: (arr.flat()) };
const { y: { at: viaParenInit } } = ({ y: arr.flat() });
const [{ y: { at: viaParenWrapSlot } }] = [{ y: (arr.flat()) }];
// ... and the wrapper HOST reads through them too, narrow included: the alias walk that decides
// whether the element leaks climbs to its declarator, and a fixed hop count - or an init matched by
// identity - answers `leak` on the leg whose parser keeps the paren, which costs the read its type
const [{ y: { at: viaParenWrapInit } }, viaParenWrapTail] = ([hb, arr]);
const [{ y: { at: viaParenWrapPair, findLast: viaParenWrapPairLast } }, viaParenWrapPairTail] = ([hb, arr.flat()]);
export { viaParenSlot, viaParenInit, viaParenWrapSlot };
export { viaParenWrapInit, viaParenWrapTail, viaParenWrapPair, viaParenWrapPairLast, viaParenWrapPairTail };
