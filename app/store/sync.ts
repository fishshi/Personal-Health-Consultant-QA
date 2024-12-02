import axios from "axios";
import { showToast } from "../components/ui-lib";
import { StoreKey, SYNC_SERVICE_URL } from "../constant";
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
  email : "",
  authToken : "",
  lastSyncTime : "",
}

export const useSyncStore = createPersistStore(
  {...defaultSync},
  (set, get) => ({
    login : async (email : string, password : string) => {
      try {
        let response = await axios.post(
          SYNC_SERVICE_URL + "/user/login",
          {
            email: email,
            password: password
          });
          if (response.data.code === 1) {
            set(() => ({
              email: email,
              authToken: response.data.data
            }));
          } else {
            showToast(response.data.msg);
            throw new Error("known");
          }
      } catch(error) {
        if (!(error instanceof Error && error.message === "known"))
          showToast("登录失败");
        throw error;
      }
    },

    register : async (email : string, password : string) => {
      try {
        let response = await axios.post(
          SYNC_SERVICE_URL + "/user/register",
          {
            email: email,
            password: password
          }
        )
        if (response.data.code === 1) {
          showToast("注册成功");
        } else {
          showToast(response.data.msg);
          throw new Error("known");
        }
      } catch(error) {
        if (!(error instanceof Error && error.message === "known"))
          showToast("注册失败");
        throw error;
      }
    },

    logout : () => {
      set(() => ({...defaultSync}))
    },

    sync : async (data : SyncData) => {
      const jsonData = JSON.stringify(data);
      try {
        let response = await axios.post(
          SYNC_SERVICE_URL + "/sync/export",
          {data: jsonData},
          {headers: {Authorization: `${get().authToken}`}}
        )
        if (response.data.code === 1) {
          set(() => ({lastSyncTime : new Date().toLocaleString()}));
          showToast("同步成功");
        } else {
          showToast(response.data.msg);
        }
      } catch (error) {
        showToast("同步失败");
      }
    },

    getRemoteData : async () => {
      try {
        let response = await axios.get(
          SYNC_SERVICE_URL + "/sync/import",
          {headers: {Authorization: `${get().authToken}`}}
        )
        if (response.data.code === 1) {
          return response.data.data as string;
        } else {
          showToast(response.data.msg);
        }
      } catch (error) {
        showToast("获取云端数据失败");
      }
    },
  }),
  {
    name: StoreKey.Sync,
  }
)