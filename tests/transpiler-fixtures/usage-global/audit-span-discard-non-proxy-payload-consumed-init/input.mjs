// a fully-consumed destructure drops its init WHOLE, and the sequence prefix sits under the member
// spine where the top-level peel never reaches it
export const consumedInit = (() => { const { of } = ({ p: Promise }, globalThis).self.Array; return typeof of; })();
