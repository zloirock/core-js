// A module type does not erase the file-level constructor value.
declare module "m" { declare type Map = number; }
const Map = function () { this.user = true; };
export const result = new Map().user;
