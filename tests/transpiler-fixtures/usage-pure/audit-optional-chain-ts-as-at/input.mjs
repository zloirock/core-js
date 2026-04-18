// `(a?.b as string[]).at(0)` - findChainRoot must recognise TSAsExpression as a transparent
// wrapper and still deopt the `?.` chain; regex-guard would otherwise trip on `(a?.b as X)`
declare const a: { b: string[] | null } | null;
(a?.b as string[]).at(0);
