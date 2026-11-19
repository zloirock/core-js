import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Optional calls and tags remain whole user receivers, preserving their this value.
const at = _at((owner.make?.()).list);
const includes = _includes((note(), owner.tag`source`).list);