// an ALIAS-rooted chain with a NON-pure-constructor leaf takes the plan's keep-alias branch:
// the unpolyfilled-key re-read keeps the user's identifier and only drops the dead hop
// (`g.self.Object` -> `g.Object.missing`) on BOTH emitters - substituting the proxy root
// (`_globalThis.Object`) on one side would desync the re-read target
const g = globalThis;
function aliasKeep({ fromEntries, missing } = g.self.Object) { return [fromEntries, missing]; }
aliasKeep();

// the SE-rescue form routes through the same re-read: the harvested prefix survives ahead of
// the synth literal, the alias-kept read composes inside it
function mk() { return null; }
function seRescue({ hasOwn, absent } = (mk(), g.self.Object)) { return [hasOwn, absent]; }
seRescue();

// direct-root control: with no alias in the chain the proxy root itself substitutes - the
// computed SE key keeps its effect in the pattern and reads through the substituted root
let tick = 0;
function directRoot({ groupBy, [(tick++, 'extra')]: x } = globalThis.Object) { return [groupBy, x]; }
directRoot();
