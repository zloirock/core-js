import type { ModuleName, TargetVersion } from "./shared.js";

declare function getModulesListForTargetVersion(version: TargetVersion): readonly ModuleName[];

export default getModulesListForTargetVersion;
