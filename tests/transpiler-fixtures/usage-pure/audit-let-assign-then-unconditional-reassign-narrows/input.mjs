// positive control for the conditional-reassign bail: unconditional reassignment AFTER
// the first one is a guaranteed rebinding to the new value at the use site, so the
// preceding-block-assignment scan should pick the latest unconditional assignment and
// narrow to ITS RHS shape. validates the fix didn't over-bail for straight-line writes
let f;
f = { data: 'string' };
f = { data: [1, 2, 3] };
f.data.at(-1);
