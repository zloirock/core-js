// `const k = 'Symbol.iterator'; k in obj` — `k`'s binding init is a StringLiteral, so the
// Identifier path through `isSymbolSourcedKey` recurses into that init and still rejects
// (string, not symbol). contrast `audit-bound-symbol-iterator-in` where init = Symbol.iterator
// (MemberExpression) and polyfill IS emitted
const k = 'Symbol.iterator';
k in obj;