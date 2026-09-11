// numeric enum member as computed key: the enum member initializer literal (0) is
// read for the computed-key value, then the `Record<number, string[]>` annotation
// resolves `rec[0]` to `string[]`, so `.at(0)` picks the Array instance method
enum NumKey { Zero = 0 }
const rec = { 0: ['x'] } as Record<number, string[]>;
rec[NumKey.Zero].at(0);
