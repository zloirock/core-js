import type { EntryName, TargetVersion } from "./shared";

declare function getEntriesListForTargetVersion(version: TargetVersion): readonly EntryName[];

export = getEntriesListForTargetVersion;
