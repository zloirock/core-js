class Local { static from() { return 0; } }
let localNs = { Base: Local };
if (c) localNs = { Base: Boolean };
class UserBase extends localNs.Base {
  static go() { return super.from('ab'); }
}
export { UserBase };
