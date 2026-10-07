import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.keys";
import "core-js/modules/web.dom-collections.values";
// A call of a key that is a static of a constructor and an instance method of other receivers (`entries`)
// over a selection the build does not decide injects both: the static for the constructor arm, the
// instance family for any other value - whichever arm runs, with or without a `?.`
const pairs = {
  k: 1
};
export const viaCall = (source ?? Object).entries(pairs);
export const viaOptionalCall = (source ?? Object).values?.(pairs);
export const viaOptionalMember = (shim || Object)?.keys(input);