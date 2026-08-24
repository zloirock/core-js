// a guard render that leads with `(` at the head of an ExpressionStatement fuses with an
// unterminated previous statement and turns it into a CALL (`sink = 1(...)`). the reprint
// owes every statement its own semicolon,
// on every channel that can spell a parenthesized guard
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

// renders that do NOT lead with `(` keep the source verbatim - the negatives that pin the guard
// to the leading token rather than to the statement position
export let foldedClaim = 6
globalThis.window?.self.Array.of(1).at(0)
export let deleteOperand = 7
delete globalThis.window?.self.hostBox.gone
export let protoPlacement = 8
globalThis.window?.self.Map.prototype.has.call(new Map([[1, 1]]), 1)

// an UNBRACED control body holds exactly one statement: a `;` ahead of the render would empty
// the body instead of separating anything, and the `(` there follows the head's own `)`
export let unbracedBody = 9
if (unbracedBody) globalThis.window?.self.hostBox.run()
