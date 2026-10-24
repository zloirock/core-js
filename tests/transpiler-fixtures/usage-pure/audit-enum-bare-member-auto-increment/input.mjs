// The bare member after a string one is opaque - the emitters disagree on what it holds - so pure
// must not hand it a family-specific helper. The explicitly initialised member is the control.
// @ts-expect-error an enum member tsc refuses is the shape under test
enum Labelled { Name = "core", Next }
const opaque: Labelled = Labelled.Next;
const known: Labelled = Labelled.Name;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
opaque.at(0);
known.includes("c");
