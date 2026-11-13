// The imported type and the local constructor occupy different namespaces.
import type { default as Map } from "@core-js/pure/actual/map";
const Map = class { user = true; };
export const result = new Map().user;
