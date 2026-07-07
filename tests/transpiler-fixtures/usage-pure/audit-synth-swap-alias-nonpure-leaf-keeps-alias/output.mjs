import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// an ALIAS-rooted chain with a NON-pure-constructor leaf takes the plan's keep-alias branch:
// the unpolyfilled-key re-read keeps the user's identifier and only drops the dead hop
// (`g.self.Object` -> `g.Object.missing`) on BOTH emitters - substituting the proxy root
// (`_globalThis.Object`) on one side would desync the re-read target
const g = _globalThis;
function aliasKeep({
  fromEntries,
  missing
} = {
  fromEntries: _Object$fromEntries,
  missing: g.Object.missing
}) {
  return [fromEntries, missing];
}
aliasKeep();

// the SE-rescue form routes through the same re-read: the harvested prefix survives ahead of
// the synth literal, the alias-kept read composes inside it
function mk() {
  return null;
}
function seRescue({
  hasOwn,
  absent
} = (mk(), {
  hasOwn: _Object$hasOwn,
  absent: g.Object.absent
})) {
  return [hasOwn, absent];
}
seRescue();

// direct-root control: with no alias in the chain the proxy root itself substitutes - the
// computed SE key keeps its effect in the pattern and reads through the substituted root
let tick = 0;
function directRoot({
  groupBy,
  [(tick++, 'extra')]: x
} = {
  groupBy: _Object$groupBy,
  "extra": _globalThis.Object["extra"]
}) {
  return [groupBy, x];
}
directRoot();