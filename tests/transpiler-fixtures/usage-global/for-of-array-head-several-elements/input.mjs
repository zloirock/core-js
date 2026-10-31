// A head over SEVERAL elements mirrors each of its own, one static per row: a bound container, a call, an
// IIFE, a parameter-filled slot under a nested level and a name bound to a call.
const held = [Math];
for (const [{ sinh: viaMixedAlias }] of [held, [Math]]) use(viaMixedAlias(1));
const build = () => [Math];
for (const [{ tanh: viaMixedCall }] of [build(), [Math]]) use(viaMixedCall(1));
for (const [{ acosh: viaMixedIife }] of [[Math], (() => [Math])()]) use(viaMixedIife(1));
const wrapKeyed = value => [{ k: value }];
for (const [{ k: { asinh: viaMixedParam } }] of [wrapKeyed(Math), [{ k: Math }]]) use(viaMixedParam(1));
const builtHeld = build();
for (const [{ atanh: viaMixedAliasOfCall }] of [builtHeld, [Math]]) use(viaMixedAliasOfCall(0));
