import _globalThis from "@core-js/pure/actual/global-this";
// An SE-bearing init joins the anchored proxy-hop family when every effect rides a re-emittable channel: a sequence prefix replays
// once ahead of the re-anchored read (or lifts standalone on full consume), a chain-assignment is rescued WHOLE.
const {
  navigator: nav
} = (eff(), _globalThis);
export const r = [nav];