import CloseIcon from "../icons/close.svg";

import { IconButton } from "./button";

import styles from "./mask.module.scss";

import ClearIcon from "../icons/clear.svg";
import ConfirmIcon from "../icons/confirm.svg";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { Diagnosis, useDiagnosisList } from "../store/diagnosis-list";
import { Modal } from "./ui-lib";

export const DiagnosisList = () => {
  const navigate = useNavigate();

  const diagnosisList = useDiagnosisList().diagnosisList;
  const rmDiagnosis = useDiagnosisList().removeDiagnosis;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<Diagnosis[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [detailId, setDetailId] = useState<number>(0);

  function DetailModal(props: { onClose: () => void }) {
    const diagnosis = diagnosisList[detailId];
    return (
      <div className="modal-mask">
        <Modal
          title={"诊断明细"}
          onClose={props.onClose}
          actions={[
            <IconButton
              type="primary"
              text={Locale.UI.Confirm}
              icon={<ConfirmIcon />}
              key="ok"
              onClick={() => {
                props.onClose();
              }}
            />,
          ]}
        >
          <div>
              {diagnosis.name}
              {diagnosis.content}
              {diagnosis.date}
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
                  setDetailId(item.id);
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