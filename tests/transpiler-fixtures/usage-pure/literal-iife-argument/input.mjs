// An IIFE argument follows the same native-wrapper policy as a direct literal.
(({ C: { from } }) => use(from))({ C: Array });
