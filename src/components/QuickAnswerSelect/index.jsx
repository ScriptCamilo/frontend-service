import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { CircularProgress } from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";

import toastError from "../../errors/toastError";
import { dataReducer } from "../../reducers/data";
import api from "../../services/api";
import { useStyles } from "./styles";

function QuickAnswerSelect(params) {
  const { searchParam, handleClick, isOpen, height } = params;
  const classes = useStyles();
  const lastQuickAnswer = useRef(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [quickAnswers, dispatch] = useReducer(dataReducer, []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchQuickAnswers = useCallback(
    async (isLoad) => {
      let data;
      try {
        if (isLoad) {
          const { data } = await api.get("/quickAnswers", {
            params: { searchParam, pageNumber },
          });
          setHasMore(data.hasMore);
          dispatch({ type: "LOAD_DATA", payload: data.quickAnswers });
        } else {
          const { data } = await api.get("/quickAnswers", {
            params: { searchParam },
          });
          setHasMore(data.hasMore);
          dispatch({ type: "SEARCH_DATA", payload: data.quickAnswers });
          setPageNumber(1);
        }

        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    },
    [searchParam, pageNumber]
  );

  useEffect(() => {
    if (hasMore && pageNumber > 1) {
      setLoading(true);
      fetchQuickAnswers(true);
    }
  }, [pageNumber, fetchQuickAnswers]);

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET_DATA" });
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        fetchQuickAnswers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchParam, isOpen]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    });
    if (lastQuickAnswer.current) {
      intersectionObserver.observe(lastQuickAnswer.current);
    }
    return () => intersectionObserver.disconnect();
  }, [quickAnswers]);

  if (!isOpen || (!quickAnswers.length && !loading)) return null;

  return (
    <ul
      className={classes.messageQuickAnswersWrapper}
      style={{ maxHeight: height }}
    >
      {quickAnswers.map((value, index, arr) => {
        return (
          <li
            ref={
              index === arr.length - 1 && hasMore ? lastQuickAnswer : undefined
            }
            className={classes.messageQuickAnswersWrapperItem}
            key={index}
          >
            {value.mediaUrl && <AttachFile />}
            <a onClick={() => handleClick(value)}>
              {`${value.shortcut} - ${value.message}`}
            </a>
          </li>
        );
      })}
      {loading && (
        <li data-loading>
          <CircularProgress />
        </li>
      )}
    </ul>
  );
}

export default QuickAnswerSelect;
