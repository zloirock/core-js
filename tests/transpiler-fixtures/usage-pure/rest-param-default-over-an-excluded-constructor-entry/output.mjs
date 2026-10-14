import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A rest parameter default over a constructor whose constructor entry the build excludes has no whole index to
// take: its claimed static extracts into the body, as over a constructor with no entry, whatever spells the
// receiver - plain, realm member, alias - and a selection reading it off the realm decides for that left, the data
// subset carrying `Promise`, so its fallback leaves with its import. A function handed out keeps its default
// native, the body extraction's caller boundary.
const P = Promise;
function plain({
  try: _unused,
  ...rest
} = Promise) {
  let attempt = _Promise$try;
  return [attempt, rest];
}
function realm({
  allSettled: _unused2,
  ...rest
} = _globalThis.Promise) {
  let allSettled = _Promise$allSettled;
  return [allSettled, rest];
}
function alias({
  any: _unused3,
  ...rest
} = P) {
  let any = _Promise$any;
  return [any, rest];
}
function either({
  withResolvers: _unused4,
  ...rest
} = _globalThis.Promise) {
  let withResolvers = _Promise$withResolvers;
  return [withResolvers, rest];
}
function nullish({
  race: _unused5,
  ...rest
} = _globalThis.Promise) {
  let race = _Promise$race;
  return [race, rest];
}
function escaping({
  reject,
  ...rest
} = _globalThis.Promise) {
  return [reject, rest];
}
use(plain(), realm(), alias(), either(), nullish(), escaping);