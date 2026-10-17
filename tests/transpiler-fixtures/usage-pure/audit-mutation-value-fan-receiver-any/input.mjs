// A write through a conditional, logical or aliased receiver patches every reachable built-in slot. Later static reads must
// observe that patch through the constructor binding.
let cond;
(cond ? globalThis : self).Promise.any = patchE;
const r5 = Promise.any(list);
export { r5 };
