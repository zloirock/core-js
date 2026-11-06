// an assignment-destructure mixing a standalone-emit prop (`[Symbol.iterator]`) BEFORE a
// nested-flatten prop (`Array: { from }`) must not queue two whole-statement overwrites; the
// standalone sibling defers to the cascade instead of self-registering a colliding overwrite
({ [Symbol.iterator]: it, Array: { from } } = globalThis);
use(it);
from(x);
