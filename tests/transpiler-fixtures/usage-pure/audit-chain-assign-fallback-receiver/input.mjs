// chain-assignment within destructure receiver: `b = (Array || Set)` evaluates to right-hand
// at runtime. peelFallbackReceiver alternates chain-assign + paren + TS + safe-SE peels until
// stable. should classify both branches symmetrically (Array union Set both have from)
const { from } = (b = (Array || Set));
from;
