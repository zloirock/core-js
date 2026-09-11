import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// The bare member after a string one is opaque - the emitters disagree on what it holds - so pure
// must not hand it a family-specific helper. The explicitly initialised member is the control.
enum Labelled {
  Name = "core",
  Next
}
const opaque: Labelled = Labelled.Next;
const known: Labelled = Labelled.Name;
_at(opaque).call(opaque, 0);
_includesMaybeString(known).call(known, "c");