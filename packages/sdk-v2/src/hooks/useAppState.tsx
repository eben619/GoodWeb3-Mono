import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { noop as _ } from "lodash";

export default () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const onChanged = state => void setAppState(state);
    const subscription = AppState.addEventListener("change", onChanged);

    return () => {
      subscription.remove();
    };
  }, [setAppState]);

  return { appState, active: appState === "active" };
};