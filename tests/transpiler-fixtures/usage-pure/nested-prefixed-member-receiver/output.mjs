import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The prefix and both getter reads belong to one extraction, including assignment hosts.
const at = _at((note(), owner.value.list));
let includes;
includes = _includes((note(), owner['value']).list);