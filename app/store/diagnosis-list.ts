import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";

import Locale from "../locales";
import { showToast } from "../components/ui-lib";

export type Diagnosis = {
  id: number;
  name: string;
  content: string;
  date: string;
};

const defaultDiagnosis = {"diagnosisList" : [{
  id: 1,
  name: "头痛",
  content: "头痛是由于头部肌肉的疼痛引起的，包括头昏、头晕、头痛、头肿、头部肌肉疼痛等。",
  date: new Date().toLocaleString()
}, {
  id: 2,
  name: "腰痛",
  content: "腰痛是由于腰部肌肉的疼痛引起的，包括腰酸、腰背痛、腰腿酸痛、腰痛、腰肌劳损等。",
  date: new Date().toLocaleString()
}]};

export const useDiagnosisList = createPersistStore(
  {...defaultDiagnosis},
  (set, get) => ({
    reset() {
      set(() => ({...defaultDiagnosis}));
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
        diagnosisList: currentList.filter(diagnosis => diagnosis.id !== diagnosisId),
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
  }),
  {
    name: StoreKey.DiagnosisList,
    merge(persistedState, currentState) {
      const state = persistedState as Diagnosis[] | undefined;
      if (!state) return { ...currentState };
      return {...currentState, diagnosisList: [...state]}; // 合并持久化状态和当前状态
    },
    migrate(persistedState) {
      const state = persistedState as Diagnosis[]; // 迁移逻辑
      return state as any;
    },
  },
);
