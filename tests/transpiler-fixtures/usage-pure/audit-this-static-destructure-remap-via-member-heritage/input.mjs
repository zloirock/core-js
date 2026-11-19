const ns = { Promise };
class MemberHeritage extends ns.Promise {
  static m() { const { try: t } = this; return t; }
}
export const viaMemberHeritage = MemberHeritage.m();
