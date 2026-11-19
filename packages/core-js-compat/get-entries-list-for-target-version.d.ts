import type { EntryName, TargetVersion } from "./shared.js";

declare function getEntriesListForTargetVersion(version: TargetVersion): readonly EntryName[];

export default getEntriesListForTargetVersion;
