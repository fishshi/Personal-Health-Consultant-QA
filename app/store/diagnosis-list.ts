import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";

import Locale from "../locales";
import { showToast } from "../components/ui-lib";
import { ChatMessage, createMessage } from "./chat";
import { useAppConfig } from "./config";
import { ClientApi, getClientApi } from "../client/api";

export type Diagnosis = {
  id: number;
  name: string;
  content: string;
  date: string;
};

const defaultDiagnosis = { diagnosisList: [] as Diagnosis[] };

export const useDiagnosisList = createPersistStore(
  { ...defaultDiagnosis },
  (set, get) => ({
    reset() {
      set(() => ({ ...defaultDiagnosis }));
    },

    syncDiagnosisList(diagnosisList: Diagnosis[]) {
      set(() => ({ diagnosisList: diagnosisList }));
    },

    addDiagnosis(newDiagnosis: Diagnosis) {
      const currentList = get().diagnosisList;
      set(() => ({
        diagnosisList: [...currentList, newDiagnosis],
      }));
    },

    removeDiagnosis(diagnosisId: number) {
      const currentList = get().diagnosisList;
      set(() => ({
        diagnosisList: currentList.filter(
          (diagnosis) => diagnosis.id !== diagnosisId,
        ),
      }));
      showToast(
        "删除诊断成功",
        {
          text: Locale.Home.Revert,
          onClick() {
            set(() => ({
              diagnosisList: [...currentList],
            }));
          },
        },
        5000,
      );
    },

    summarizeChatAsDiagnosis(chatMessage: ChatMessage[]) {
      let systemMessage: ChatMessage = createMessage({
        role: "user",
        content:
          "请根据上面的对话，总结用户为用户进行诊断。\n输出格式为：“<病症名称> <注意事项>”。示例：“头疼 注意保持良好的睡眠习惯\n保持饮食均衡\n定期检查身体”。注意：不需要输出尖括号，只能有一个空格在病症名称和注意事项之间，注意事项中若要分点用换行而不是空格，同时开始和结尾不需要总结句。",
      });
      let sendMessage = chatMessage.concat([systemMessage]);
      console.log("[Diagnosis] summarize chat", sendMessage);
      const config = useAppConfig.getState();
      const modelConfig = config.modelConfig;
      const api: ClientApi = getClientApi(modelConfig.providerName);
      showToast("正在生成诊断，请稍候...");
      api.llm.chat({
        messages: sendMessage,
        config: { ...modelConfig },
        onFinish(message) {
          console.log("[Diagnosis] summarize result", message);
          let messageSplit = message.split(" ");
          const diagnosis: Diagnosis = {
            id: new Date().getTime(),
            name: messageSplit[0],
            content: messageSplit.slice(1)?.join(" "),
            date: new Date().toLocaleString(),
          };
          let currDiagnosisList = get().diagnosisList;
          set(() => ({
            diagnosisList: [...currDiagnosisList, diagnosis],
          }));
          showToast(
            "生成诊断成功",
            {
              text: Locale.Home.Revert,
              onClick() {
                set(() => ({
                  diagnosisList: currDiagnosisList,
                }));
              },
            },
            5000,
          );
        },
        onError(error) {
          console.error("[Diagnosis] summarize failed", error);
        },
      });
    },
  }),
  {
    name: StoreKey.DiagnosisList,
  },
);
