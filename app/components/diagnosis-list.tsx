import CloseIcon from "../icons/close.svg";

import { IconButton } from "./button";

import styles from "./mask.module.scss";

import ClearIcon from "../icons/clear.svg";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { Diagnosis, useDiagnosisList } from "../store/diagnosis-list";
import { Modal, showImageModal, showToast } from "./ui-lib";
import { downloadAs, useMobileScreen } from "../utils";
import { toJpeg } from "html-to-image";
import { getClientConfig } from "../config/client";

export const DiagnosisList = () => {
  const navigate = useNavigate();
  const isMobile = useMobileScreen();
  const isApp = getClientConfig()?.isApp;

  const diagnosisList = useDiagnosisList().diagnosisList;
  const rmDiagnosis = useDiagnosisList().removeDiagnosis;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [searchResults, setSearchResults] = useState<Diagnosis[]>([]);

  const [showDetail, setShowDetail] = useState(false);
  const [detailDiagnosis, setDetailDiagnosis] = useState<Diagnosis | null>(null);

  const downLoadAsJpeg = async (dom: HTMLDivElement) => {
    try {
      const blob = await toJpeg(dom, {backgroundColor: "#fff"});
      if (!blob) return;
      
      if (isMobile || (isApp && window.__TAURI__)) {
        if (isApp && window.__TAURI__) {
          const result = await window.__TAURI__.dialog.save({
            defaultPath: `${detailDiagnosis!.name}.jpg`,
            filters: [
              {
                name: "JPGE Files",
                extensions: ["jpg"],
              },
              {
                name: "All Files",
                extensions: ["*"],
              },
            ],
          });

          if (result !== null) {
            const response = await fetch(blob);
            const buffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            await window.__TAURI__.fs.writeBinaryFile(result, uint8Array);
            showToast(Locale.Download.Success);
          } else {
            showToast(Locale.Download.Failed);
          }
        } else {
          showImageModal(blob);
        }
      } else {
        const link = document.createElement("a");
        link.download = `${detailDiagnosis!.name}.jpg`;
        link.href = blob;
        link.click();
        if (dom)
          dom.innerHTML = dom.innerHTML; // Refresh the content of the preview by resetting its HTML for fix a bug glitching
      }
    } catch (error) {
      showToast(Locale.Download.Failed);
    }
  }

  function DetailModal(props: { onClose: () => void }) {
    return (
      <div className="modal-mask">
        <Modal
          title={"诊断明细"}
          onClose={props.onClose}
          actions={[
            <IconButton
              type="primary"
              text={Locale.UI.Export + "为txt"}
              key="exportastxt"
              onClick={() => {
                if (!detailDiagnosis) return;
                downloadAs(detailDiagnosis.name + detailDiagnosis.content + detailDiagnosis.date, "txt")
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.UI.Export + "为图片"}
              key="exportasimage"
              onClick={() => {
                if (!detailDiagnosis) return;
                const dom = previewRef.current;
                if (!dom) return;
                downLoadAsJpeg(dom);
              }}
            />,
          ]}
        >
          <div ref={previewRef}>
              {detailDiagnosis?.name}
              {detailDiagnosis?.content}
              {detailDiagnosis?.date}
          </div>
        </Modal>
      </div>
    );
  }

  useEffect(() => {
    setSearchResults(diagnosisList);
  }, [diagnosisList]);

  const doSearch = useCallback((searchText: string) => {
    let results = diagnosisList;
    if (searchText.length > 0) {
      results = diagnosisList.filter((item : Diagnosis) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    )}
    return results;
  },[])

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header" data-tauri-drag-region>
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.DiagnosisList.Title}
            </div>
          </div>
          <div className="window-actions">
            <div className="window-action-button"></div>
            <div className="window-action-button"></div>
            <div className="window-action-button">
              <IconButton
                aria={Locale.UI.Close}
                icon={<CloseIcon />}
                onClick={() => navigate(Path.Home)}
                bordered
              />
            </div>
          </div>
        </div>

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            {/**搜索输入框 */}
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.SearchChat.Page.Search}
              autoFocus
              ref={searchInputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const searchText = e.currentTarget.value;
                  const result = doSearch(searchText);
                  setSearchResults(result);
                }
              }}
            />
          </div>
            
          <div>
            {searchResults.map((item) => (
              <div
                className={styles["mask-item"]}
                key={item.id}
                onClick={() => {
                  setDetailDiagnosis(item);
                  setShowDetail(true);
                }}
                style={{ cursor: "pointer" }}
              >
                {/** 搜索匹配的文本 */}
                <div className={styles["mask-header"]}>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>{item.name}</div>
                    {item.content.slice(0, 70)}
                    <div>{item.date}</div>
                  </div>
                </div>
                {/** 操作按钮 */}
                <div className={styles["mask-actions"]}>
                  <IconButton
                    icon={<ClearIcon />}
                    text={Locale.Chat.Actions.Delete}
                    onClick={(event) => {
                      event!.stopPropagation();
                      rmDiagnosis(item.id);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showDetail && (
        <DetailModal onClose={() => setShowDetail(false)} />
      )}
    </ErrorBoundary>
  );
}