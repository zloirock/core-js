// `obj.member++` update on a member: the operand member position is a write target
// and is preserved verbatim, no polyfill rewrite at that site.
obj.at++;
--obj.at;
