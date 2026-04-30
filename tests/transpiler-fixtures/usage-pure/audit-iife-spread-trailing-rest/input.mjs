// IIFE call with array literal containing trailing rest spread: `[a, b, ...rest]`.
// Inner SpreadElement at any position causes `detectIifeArgPath` to bail (paramIndex
// would be off by N positions when `rest` expands variadic). Verify body-extract takes
// over - the user's call shape itself is unusual but valid
const tail = [1, 2];
(({ from }) => from([1]))(...[Array, ...tail]);
