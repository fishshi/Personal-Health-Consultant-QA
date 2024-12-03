import { IconButton } from "./button";
import {
  EmailInput,
  List,
  ListItem,
  Modal,
  PasswordInput,
  showToast,
} from "./ui-lib";
import Locale from "../locales";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import { useMemo } from "react";
import { useChatStore } from "../store/chat";
import { usePromptStore } from "../store/prompt";
import { SyncData, useDiagnosisList, useSyncStore } from "../store";
import { downloadAs, readFromFile } from "../utils";
import React from "react";

export const SYNC_CONFIG = async () => {
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
      diagnosis: diagnosisCount,
    };
  }, [chatStore.sessions, diagnosisStore.diagnosisList, promptStore.counter]);

  const remoteExportData = () => {
    const data: SyncData = {
      session: chatStore.sessions,
      prompt: promptStore.prompts,
      diagnosisList: diagnosisStore.diagnosisList,
    };
    try {
      syncStore.sync(data);
    } catch (e) {
      if (!(e instanceof Error) || e.message !== "known") showToast("上传失败");
    }
  };

  const remoteImportData = async () => {
    try {
      const rawContent = await syncStore.getRemoteData();
      if (!rawContent) return;

      const remoteState: SyncData = JSON.parse(rawContent);
      chatStore.syncSessions(remoteState.session);
      promptStore.syncPrompts(remoteState.prompt);
      diagnosisStore.syncDiagnosisList(remoteState.diagnosisList);
      showToast("下载成功");
    } catch (e) {
      if (!(e instanceof Error) || e.message !== "known") showToast("下载失败");
      console.error("[Import]", e);
    }
  };

  const exportData = async () => {
    const data: SyncData = {
      session: chatStore.sessions,
      prompt: promptStore.prompts,
      diagnosisList: diagnosisStore.diagnosisList,
    };
    downloadAs(
      JSON.stringify(data),
      `Backup-${new Date().toLocaleString()}.json`,
    );
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
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");

    if (isLogin) {
      return (
        <div className="modal-mask">
          <Modal
            title={"登录"}
            onClose={props.onClose}
            actions={[
              <IconButton
                type="primary"
                text={"登录"}
                key="login"
                onClick={async () => {
                  if (email === "" || password === "") return;
                  if (email.indexOf("@") === -1) {
                    showToast("请输入正确的邮箱");
                    return;
                  }
                  try {
                    await syncStore.login(email, password);
                    await syncStore.syncTime();
                    setLogin(true);
                    props.onClose();
                  } catch (e) {
                    if (!(e instanceof Error) || e.message !== "known")
                      showToast("登录失败");
                  }
                }}
              />,
              <IconButton
                type="primary"
                text={"去注册"}
                key="go-register"
                onClick={() => {
                  setIsLogin(false);
                }}
              />,
            ]}
          >
            <EmailInput
              style={{ marginLeft: "50%", marginTop: "5%", marginBottom: "5%" }}
              value={email}
              type="text"
              placeholder={"请输入邮箱"}
              onChange={(e) => {
                setEmail(e.currentTarget.value);
              }}
            />
            <PasswordInput
              style={{ marginLeft: "50%" }}
              value={password}
              type="text"
              placeholder={"请输入密码"}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
          </Modal>
        </div>
      );
    }
    return (
      <div className="modal-mask">
        <Modal
          title={"注册"}
          onClose={props.onClose}
          actions={[
            <IconButton
              type="primary"
              text={"注册"}
              key="register"
              onClick={async () => {
                if (email === "" || password === "") return;
                if (email.indexOf("@") === -1) {
                  showToast("请输入正确的邮箱");
                  return;
                }
                if (password !== confirmPassword) {
                  showToast("两次输入的密码不一致");
                  return;
                }
                try {
                  await syncStore.register(email, password);
                  await syncStore.login(email, password);
                  await syncStore.syncTime();
                  setLogin(true);
                  props.onClose();
                } catch (e) {
                  if (!(e instanceof Error) || e.message !== "known")
                    showToast("注册失败");
                }
              }}
            />,
            <IconButton
              type="primary"
              text={"去登录"}
              key="go-login"
              onClick={() => {
                setIsLogin(true);
              }}
            />,
          ]}
        >
          <EmailInput
            style={{ marginLeft: "50%", marginTop: "5%", marginBottom: "5%" }}
            value={email}
            type="text"
            placeholder={"请输入邮箱"}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
            }}
          />
          <PasswordInput
            style={{ marginLeft: "50%" }}
            value={password}
            type="text"
            placeholder={"请输入密码"}
            onChange={(e) => {
              setPassword(e.currentTarget.value);
            }}
          />
          <div style={{ height: "0px", marginBottom: "2.5%" }}></div>
          <PasswordInput
            style={{ marginLeft: "50%" }}
            value={confirmPassword}
            type="text"
            placeholder={"请确认密码"}
            onChange={(e) => {
              setConfirmPassword(e.currentTarget.value);
            }}
          />
        </Modal>
      </div>
    );
  };

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
          </ListItem>
        )}

        {login && (
          <ListItem title={"当前账户：" + syncStore.email}>
            <IconButton
              text={"登出"}
              onClick={() => {
                syncStore.logout();
                setLogin(false);
              }}
            />
          </ListItem>
        )}

        {login && (
          <ListItem
            title={Locale.Settings.Sync.CloudState}
            subTitle={
              syncStore.lastSyncTime === ""
                ? Locale.Settings.Sync.NotSyncYet
                : "已于" + syncStore.lastSyncTime + "同步"
            }
          >
            <div style={{ display: "flex" }}>
              <IconButton
                aria={Locale.UI.Export}
                icon={<UploadIcon />}
                text={"上传"}
                onClick={() => {
                  remoteExportData();
                }}
              />
              <IconButton
                aria={Locale.UI.Import}
                icon={<DownloadIcon />}
                text={"下载"}
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
};
