// A for-init flatten declaration whose sibling extracts an instance method: the for-init header is a
// single comma-list, so the flatten binding and the sibling's rewrite stay comma-joined in place
for (const { Array: { from } } = globalThis, { at } = getArr(); from([1]) && at([2]); ) break;
