// a DEFAULT beside a call's slot fires where the callee's literal spells no such slot, so the binding
// holds the default: usage-global injects its static, pure reads it off the default
const empty = () => ({});
const { a: viaDefault = Object } = empty();
export const fromDefault = viaDefault.values({ k: 1 });
