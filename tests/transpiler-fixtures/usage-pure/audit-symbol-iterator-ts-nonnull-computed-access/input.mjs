// TSNonNullExpression wrapper on Symbol - unwrapParens handles `!` too
const iter = obj[(Symbol!).iterator];
