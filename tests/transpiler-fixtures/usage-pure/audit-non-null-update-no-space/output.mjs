// no-space between non-null `!` and update `--/++` operator
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
Set! --;
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
WeakMap!++;