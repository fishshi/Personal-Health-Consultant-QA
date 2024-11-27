import { StoreKey } from "../constant";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";

function formatVersionDate(t: string) {
  const d = new Date(+t);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("");
}

type VersionType = "date" | "tag";

export const useUpdateStore = createPersistStore(
  {
    versionType: "tag" as VersionType,
    lastUpdate: 0,
    version: "unknown",
    used: 0,
    subscription: 0,
    lastUpdateUsage: 0,
  },
  (set, get) => ({
    formatVersion(version: string) {
      if (get().versionType === "date") {
        version = formatVersionDate(version);
      }
      return version;
    },

    async getVersion() {
      const versionType = get().versionType;
      let version =
        versionType === "date"
          ? getClientConfig()?.commitDate
          : getClientConfig()?.version;

      set(() => ({ version }));
    },
  }),
  {
    name: StoreKey.Update,
    version: 1,
  },
);
