// A JSX tag names its binding to a renderer, which may do anything with the value - so the tag is an
// ESCAPE, and every narrow that rests on enumerating the binding's references has to drop. Three of
// them do: an array's ELEMENT type, an object literal's alias closure, and a member-path discriminant.
// Each row keeps the same receiver shape as its control below, so the only difference is the tag.
const elementRetype = [['a']];
export const viaElement = elementRetype[0].at(0);

const aliasClosure = { xs: ['a'] };
export const viaAlias = aliasClosure.xs.at(0);

const memberPath = { kind: 'a', xs: ['a'] };
export const viaMemberPath = memberPath.xs.at(0);

export const tags = [
  <elementRetype.Sub x={1} />,
  <aliasClosure.Sub x={2} />,
  <memberPath.Sub x={3} />,
];

// CONTROL: the same three shapes with no tag naming them keep the array-specific narrow, so the file
// shows the narrow being dropped rather than a resolver that never narrowed at all.
const cleanElement = [['a']];
const cleanAlias = { xs: ['a'] };
const cleanMemberPath = { kind: 'a', xs: ['a'] };
export const clean = [cleanElement[0].at(0), cleanAlias.xs.at(0), cleanMemberPath.xs.at(0)];
