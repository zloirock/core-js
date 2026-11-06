// A realm hop folds according to the value its consumer observes. An environment
// probe read by a kept store or a guard retains its slot over the backed root;
// plain navigation through the run follows the realm-collapse rule. Terminal
// values and computed-key effects remain observable in their original positions.
let e = 0;
// ... and a harvested effect PREFIX does not revive the guard such a fold leaves behind: the
// sequence hands its tail on, and that tail is the binding the substitution landed
export const foldedPrefixGuard = (e++, globalThis).self.window?.name;
export { e };
