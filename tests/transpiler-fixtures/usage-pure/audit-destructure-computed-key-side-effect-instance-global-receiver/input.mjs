// the residual-extract copies the receiver beside the kept residual; a global nested in the literal
// receiver must be substituted in the COPY too (the in-place residual's visitor rewrite can't reach it),
// else the extracted call ReferenceErrors on engines lacking the global
const { [(effectful(), 'flat')]: m } = [1, Promise];
const probe = [3].at(0);
