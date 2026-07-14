import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a discriminated union resolves through the discriminant test, which reaches the hoisted binding by
// identity. the two test forms are separate paths in that resolver, so they get a method each
declare const discSrc: {
  kind: "a";
  v: string[];
} | {
  kind: "b";
  v: string;
};
export function viaDiscriminantIf() {
  {
    var box = discSrc;
  }
  {
    if (box.kind === "a") return box.v.at(0);
  }
}
export function viaDiscriminantSwitch() {
  {
    var boxed = discSrc;
  }
  {
    switch (boxed.kind) {
      case "a":
        return boxed.v.includes("x");
    }
  }
}