// a super class reached through a container hop whose value BRANCHES enumerates the arms the
// member-read sibling off that very slot enumerates - the heritage axis asks what value the
// clause captured, never how it was spelled. each class picks a static only one arm carries,
// so its import can only come from the enumerated arm; distinct method per class.
const c = Math.random() > 0.5;

const inSlot = { Base: c ? Object : Promise };
export class ViaSlot extends inSlot.Base { static m() { return super.any([]); } }

const overContainer = c ? { Base: Object } : { Base: Array };
export class ViaContainer extends overContainer.Base { static m() { return super.fromAsync([]); } }

const inElement = [c ? Map : Object, 0];
export class ViaElement extends inElement[0] { static m() { return super.groupBy([], x => x); } }

const nested = { inner: { Base: (c && Object) || String } };
export class ViaNested extends nested.inner.Base { static m() { return super.raw`x`; } }

// NEGATIVE: neither arm carries the static, so the key brings in no module of its own
const noStatic = { Base: c ? Object : Boolean };
export class ViaNoStatic extends noStatic.Base { static m() { return super.notAStatic; } }
