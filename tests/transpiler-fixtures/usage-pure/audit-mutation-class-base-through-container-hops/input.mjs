// the base a subclass inherits its statics from is the same base whichever way the source spells
// it: a container slot, a slot one level down, or a read off an alias of the container. each one
// carries the base's statics, exactly as a bare `extends Map` does; the sibling slot pins the
// precision, since only the slot the base actually reads is escalated
const container = { Base: Map, Other: WeakSet };
class ViaContainer extends container.Base {}
use(ViaContainer.groupBy);
use(new container.Other());

const nested = { inner: { Base: Set } };
class ViaMember extends nested.inner.Base {}
use(ViaMember.groupBy);

const box = { Base: WeakMap };
const alias = box;
class ViaAlias extends alias.Base {}
use(ViaAlias.groupBy);
