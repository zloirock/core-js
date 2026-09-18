import _Map from "@core-js/pure/actual/map";
// An opaque iteration still carries its source into a head passed to an unknown consumer.
// A substituted constructor must retain the statics an unknown consumer can read.
async function expose() {
  for await (const value of [_Map]) hand(value);
}