import axios from "axios";
import { showToast } from "../components/ui-lib";
import { StoreKey, SYNC_SERVICE_URL } from "../constant";
import { createPersistStore } from "../utils/store";
import { ChatSession } from "./chat";
import { Diagnosis } from "./diagnosis-list";
import { Prompt } from "./prompt";
import { encrypt } from "../utils/sha256";

export type SyncData = {
  session: ChatSession[];
  prompt: Record<string, Prompt>;
  diagnosisList: Diagnosis[];
};

const defaultSync = {
  email: "",
  authToken: "",
  lastSyncTime: "",
};

export const useSyncStore = createPersistStore(
  { ...defaultSync },
  (set, get) => ({
    login: async (email: string, password: string) => {
      let response = await axios.post(SYNC_SERVICE_URL + "/user/login", {
        email: email,
        password: encrypt(password),
      });
      if (response.data.code === 1) {
        set(() => ({
          email: email,
          authToken: response.data.data,
        }));
      } else {
        showToast(response.data.msg);
      }
    },

    register: async (email: string, password: string) => {
      let response = await axios.post(SYNC_SERVICE_URL + "/user/register", {
        email: email,
        password: encrypt(password),
      });
      if (response.data.code !== 1) {
        showToast(response.data.msg);
      }
    },

    logout: () => {
      set(() => ({ ...defaultSync }));
    },

    sync: async (data: SyncData) => {
      const jsonData = JSON.stringify(data);

      let response = await axios.post(
        SYNC_SERVICE_URL + "/sync/export",
        { data: jsonData },
        { headers: { Authorization: `${get().authToken}` } },
      );
      if (response.data.code === 1) {
        set(() => ({ lastSyncTime: new Date().toLocaleString() }));
      } else {
        showToast(response.data.msg);
      }
    },

    getRemoteData: async () => {
      let response = await axios.get(SYNC_SERVICE_URL + "/sync/import", {
        headers: { Authorization: `${get().authToken}` },
      });
      if (response.data.code === 1) {
        set(() => ({ lastSyncTime: response.data.data.sync_time }));
        return response.data.data.sync_data as string;
      } else {
        showToast(response.data.msg);
      }
    },

    syncTime: async () => {
      let response = await axios.get(SYNC_SERVICE_URL + "/sync/import", {
        headers: { Authorization: `${get().authToken}` },
      });
      if (response.data.code === 1)
        set(() => ({ lastSyncTime: response.data.data.sync_time }));
    },
  }),
  {
    name: StoreKey.Sync,
  },
);
