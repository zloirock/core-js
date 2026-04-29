// an arrow IIFE call argument has a trailing comma; the receiver-substitution must preserve it untouched.
(({ from }) => from(1))(Array,);
