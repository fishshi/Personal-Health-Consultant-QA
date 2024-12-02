import { showToast } from "../components/ui-lib";
import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import { ChatSession } from "./chat";
import { Diagnosis } from "./diagnosis-list";
import { Prompt } from "./prompt";

export type SyncData = {
  session : ChatSession[],
  prompt : Record<string, Prompt>,
  diagnosisList : Diagnosis[]
}

const defaultSync = {
  userName : "",
  authToken : "",
  lastSyncTime : "",
}

export const useSyncStore = createPersistStore(
  {...defaultSync},
  (set, get) => ({
    login : (userName : string, password : string) => {
      try {

      } catch(error) {
        showToast("登录失败");
      }
    },

    register : (userName : string, password : string) => {
      try {

      } catch(error) {
        showToast("注册失败");
      }
    },

    logout : () => {
      set(() => ({...defaultSync}))
    },

    sync : (data : SyncData) => {
      const jsonData = JSON.stringify(data);
      try {

        set(() => ({lastSyncTime : new Date().toLocaleString()}));
      } catch (error) {
        showToast("同步失败");
      }
    },

    getRemoteData : () => {
      try {

        return "";
      } catch (error) {
        showToast("获取云端数据失败");
      }
    }
  }),
  {
    name: StoreKey.Sync,
  }
)