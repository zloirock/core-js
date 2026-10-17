class R7 { static M = Object; }
R7 = { M: Promise };
const { withResolvers: viaClassReassign } = R7.M;
export { viaClassReassign };
