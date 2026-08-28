import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `from` here is destructured from the Array constructor itself (Array.from). usage-global rewrites
// nothing, so the claim has only the head's own shape to resolve against - and a head declarator
// holds no init, which is why its receiver is the ELEMENT of the iterated literal rather than a
// slot. asking the canon for it is what installs the module here
for (var {
  from
} of [Array]) {
  record(from);
}