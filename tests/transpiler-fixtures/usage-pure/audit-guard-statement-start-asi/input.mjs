// statements with no semicolons: a guard render leading with `(` - an operator around the folded
// value - would fuse with the unterminated statement above it into a CALL (`x = 1(...)`), so the
// reprint owes every statement its own semicolon. the renders leading with `null ==` (a lifted nav,
// member or call, a folded claim, a guarded `delete`, a prototype read) are the negatives, and an
// unbraced control body holds exactly one statement, where a `;` ahead of the render would empty it.
export let liftedNav = 1
globalThis.window?.self.hostBox.run()
export let liftedMember = 2
globalThis.window?.self.hostBox.field
export let liftedOptionalCallee = 3
globalThis.window?.self.hostBox?.run?.()
export let liftedOperand = 4
globalThis.window?.self.hostBox.field + 1
export let claimUnderOperator = 5
globalThis.window?.self.Number.parseInt('4', 10) >> 1
export let foldedClaim = 6
globalThis.window?.self.Array.of(1).at(0)
export let deleteOperand = 7
delete globalThis.window?.self.hostBox.gone
export let protoPlacement = 8
globalThis.window?.self.Map.prototype.has.call(new Map([[1, 1]]), 1)
export let unbracedBody = 9
if (unbracedBody) globalThis.window?.self.hostBox.run()
