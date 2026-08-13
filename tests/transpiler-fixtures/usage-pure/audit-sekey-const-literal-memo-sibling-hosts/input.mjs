// a CONSTANT-literal receiver with a side-effecting key on SIBLING-declarator hosts
// (multi-declarator / for-init): the receiver memo routes through the sibling-aware channel and
// plants as a preceding comma declarator at the source slot, so the extraction reads a declared
// ref. the standalone host keeps the hoisted-statement memo (control).
// sidecar: on the standalone control the emitters agree on values but not on shape - unplugin
// hoists the memo and the effect-free extraction as preceding statements, babel appends a
// trailing comma declarator after the kept-key residual
let k = 0;
var { [(k++, 'at')]: a, other } = [7, 8], z = 1;
for (var { [(k++, 'flat')]: f, other2 } = [[1], 2], i = 0; i < 1; i++) console.log(f);
var { [(k++, 'includes')]: inc, other3 } = [5, 6];
console.log(a, z, inc, k, other, other2, other3);
