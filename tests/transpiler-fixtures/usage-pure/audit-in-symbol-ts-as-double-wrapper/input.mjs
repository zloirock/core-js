// unwrapParens `while`-loop must peel nested TS wrappers too, not just one level
((Symbol as any) as any).iterator in obj;
