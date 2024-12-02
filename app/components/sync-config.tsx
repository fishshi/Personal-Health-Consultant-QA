import { IconButton } from "./button";
import { List, ListItem, Modal, showToast } from "./ui-lib";
import Locale from "../locales";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import { useMemo } from "react";
import { useChatStore } from "../store/chat";
import { usePromptStore } from "../store/prompt";
import { SyncData, useDiagnosisList, useSyncStore } from "../store";
import { downloadAs, readFromFile } from "../utils";
import React from "react";

export const SYNC_CONFIG = () => {
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const diagnosisStore = useDiagnosisList();
  const syncStore = useSyncStore();

  const [login, setLogin] = React.useState(syncStore.authToken !== "");
  const [showLogin, setShowLogin] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);

  const stateOverview = useMemo(() => {
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

  const remoteExportData = async () => {
    const data : SyncData = {session: chatStore.sessions, prompt: promptStore.prompts, diagnosisList: diagnosisStore.diagnosisList}
    syncStore.sync(data);
  }

  const remoteImportData = async () => {
    const rawContent = syncStore.getRemoteData();
    if (!rawContent) return;

    try {
      const remoteState : SyncData = JSON.parse(rawContent);
      chatStore.syncSessions(remoteState.session);
      promptStore.syncPrompts(remoteState.prompt);
      diagnosisStore.syncDiagnosisList(remoteState.diagnosisList);
      showToast("导入成功");
    } catch (e) {
      console.error("[Import]", e);
      showToast(Locale.Settings.Sync.ImportFailed);
    }
  }

  const exportData = async () => {
    const data : SyncData = {session: chatStore.sessions, prompt: promptStore.prompts, diagnosisList: diagnosisStore.diagnosisList}
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

  const LoginModal = (props: { onClose: () => void }) => {

    if (isLogin) {
      return (
        <div className="modal-mask">
          <Modal
            title={"登录"}
            onClose={props.onClose}
          >
          </Modal>
        </div>
      );
    }
    return (
      <div className="modal-mask">
        <Modal
          title={"注册"}
          onClose={props.onClose}
        >
        </Modal>
      </div>
    );
  }

  return (
    <>
      <List>
        {!login && (
          <ListItem title={"当前未登录，登录后可使用云端同步功能"}>
            <IconButton
              text="登录"
              onClick={() => {
                setShowLogin(true);
              }}
            />
          </ ListItem>
        )}

        {login && (
          <ListItem title={"当前账户：" + syncStore.userName}>
            <IconButton
              text = {"登出"}
              onClick = {() => {
                syncStore.logout();
                setLogin(false);
              }}
            />
          </ ListItem>
        )}

        {login && (
          <ListItem
            title={Locale.Settings.Sync.CloudState}
            subTitle={ syncStore.lastSyncTime === "" ? Locale.Settings.Sync.NotSyncYet : "已于" + syncStore.lastSyncTime + "同步"}
          >
            <div style={{ display: "flex" }}>
              <IconButton
                aria={Locale.UI.Export}
                icon={<UploadIcon />}
                text={Locale.UI.Export}
                onClick={() => {
                  remoteExportData();
                }}
              />
              <IconButton
                aria={Locale.UI.Import}
                icon={<DownloadIcon />}
                text={Locale.UI.Import}
                onClick={() => {
                  remoteImportData();
                }}
              />
            </div>
          </ListItem>
        )}

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
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}