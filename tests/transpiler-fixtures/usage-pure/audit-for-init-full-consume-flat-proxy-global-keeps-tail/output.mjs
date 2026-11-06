import _Map from "@core-js/pure/actual/map";
// A fully consumed loop initializer carries its effects into the first extracted binding.
// The pristine proxy tail has no remaining reader and needs no temporary or import.
// The call runs before binding writes and the loop test.
function eff() {}
for (const Map = (eff(), _Map); false;) {
  console.log(Map);
}