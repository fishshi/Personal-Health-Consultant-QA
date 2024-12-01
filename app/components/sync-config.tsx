import { IconButton } from "./button";
import { List, ListItem, showToast } from "./ui-lib";
import Locale from "../locales";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import ConfigIcon from "../icons/config.svg";
import { useMemo } from "react";
import { useChatStore } from "../store/chat";
import { usePromptStore } from "../store/prompt";
import { useDiagnosisList } from "../store";
import { downloadAs, readFromFile } from "../utils";

export const SYNC_CONFIG = () => {
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const diagnosisStore = useDiagnosisList();

  const stateOverview = useMemo(() => {
    console.log("stateOverview");
    const sessions = chatStore.sessions;
    const messageCount = sessions.reduce((p, c) => p + c.messages.length, 0);
    const diagnosisCount = diagnosisStore.diagnosisList.length;
  
    return {
      chat: sessions.length,
      message: messageCount,
      prompt: promptStore.counter,
      diagnosis: diagnosisCount
    };
  }, [chatStore.sessions, diagnosisStore.diagnosisList, promptStore.counter]);

  const exportData = () => {
    const data = {session: chatStore.sessions, prompt: promptStore.prompts, diagnosisList: diagnosisStore.diagnosisList}
    downloadAs(JSON.stringify(data), `Backup-${new Date().toLocaleString()}.json`);
  };

  const importData = async () => {
    const rawContent = await readFromFile();

    try {
      const remoteState = JSON.parse(rawContent);
      chatStore.syncSessions(remoteState.session);
      promptStore.syncPrompts(remoteState.prompt);
      diagnosisStore.syncDiagnosisList(remoteState.diagnosisList);
      showToast("导入成功");
    } catch (e) {
      console.error("[Import]", e);
      showToast(Locale.Settings.Sync.ImportFailed);
    }
  };

  return (
    <>
      <List>
        <ListItem
          title={Locale.Settings.Sync.CloudState}
          subTitle={Locale.Settings.Sync.NotSyncYet}
        >
          <div style={{ display: "flex" }}>
            <IconButton
              aria={Locale.Settings.Sync.CloudState + Locale.UI.Config}
              icon={<ConfigIcon />}
              text={Locale.UI.Config}
              onClick={() => {
              }}
            />
          </div>
        </ListItem>

        <ListItem
          title={Locale.Settings.Sync.LocalState}
          subTitle={Locale.Settings.Sync.Overview(stateOverview)}
        >
          <div style={{ display: "flex" }}>
            <IconButton
              aria={Locale.Settings.Sync.LocalState + Locale.UI.Export}
              icon={<UploadIcon />}
              text={Locale.UI.Export}
              onClick={() => {
                exportData();
              }}
            />
            <IconButton
              aria={Locale.Settings.Sync.LocalState + Locale.UI.Import}
              icon={<DownloadIcon />}
              text={Locale.UI.Import}
              onClick={() => {
                importData();
              }}
            />
          </div>
        </ListItem>
      </List>
    </>
  );
}