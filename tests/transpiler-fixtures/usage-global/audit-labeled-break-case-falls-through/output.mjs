import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A labeled break leaves its own wrapper and nothing more, so a statement behind it is dead and
// the case still falls through into the next one - which then sees both branches. Only a real
// function-level exit stops the fall-through and lets the next case keep its own narrow: pure
// hands the fall-through row the family-agnostic helper and the exiting row a string-specific one.
type Box = {
  kind: "a";
  body: number[];
} | {
  kind: "b";
  body: string;
};
type Crate = {
  tag: "x";
  items: number[];
} | {
  tag: "y";
  items: string;
};
declare const box: Box;
declare const crate: Crate;
switch (box.kind) {
  case "a":
    outer: {
      break outer;
      throw 0;
    }
  case "b":
    box.body.at(0);
}
switch (crate.tag) {
  case "x":
    guarded: {
      throw 0;
    }
  case "y":
    crate.items.includes("a");
}