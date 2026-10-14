// Member targets under a realm hop beside an effect-keyed sibling read the mirrored literal: the key runs in its
// own place and each target is written in source order, alike in both legs.
const o = {};
({ Object: { [(e(), 'entries')]: o.f, values: globalThis.g } } = globalThis);
