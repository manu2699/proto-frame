// Navigation state: which screen is active, the active state per screen, the
// open modal (if any), and the interaction mode (comment vs prototype).

import { useCallback, useMemo, useReducer } from "react";
import type { WFModel } from "../types";

export type Mode = "comment" | "prototype";
export type DrawMode = "sketch" | "clean";

const DRAW_MODE_KEY = "wfc:draw-mode";

function readDrawMode(): DrawMode {
  try {
    return localStorage.getItem(DRAW_MODE_KEY) === "clean" ? "clean" : "sketch";
  } catch {
    return "clean";
  }
}

interface NavState {
  screenId: string;
  stateByScreen: Record<string, string>; // screenId → active stateId
  modalId: string | null;
  mode: Mode;
  drawMode: DrawMode;
}

type NavAction =
  | { type: "goto"; id: string }
  | { type: "setState"; screenId: string; stateId: string }
  | { type: "openModal"; id: string }
  | { type: "closeModal" }
  | { type: "setMode"; mode: Mode }
  | { type: "setDrawMode"; drawMode: DrawMode };

function reducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "goto":
      return { ...state, screenId: action.id };
    case "setState":
      return {
        ...state,
        stateByScreen: { ...state.stateByScreen, [action.screenId]: action.stateId },
      };
    case "openModal":
      return { ...state, modalId: action.id };
    case "closeModal":
      return { ...state, modalId: null };
    case "setMode":
      return { ...state, mode: action.mode };
    case "setDrawMode":
      try { localStorage.setItem(DRAW_MODE_KEY, action.drawMode); } catch { /* ignore */ }
      return { ...state, drawMode: action.drawMode };
  }
}

export function useNav(model: WFModel) {
  const init = useMemo<NavState>(() => {
    const stateByScreen: Record<string, string> = {};
    for (const s of model.screens) stateByScreen[s.id] = (s.states ?? [])[0]?.id;
    return {
      screenId: model.screens[0]?.id,
      stateByScreen,
      modalId: null,
      mode: "prototype",
      drawMode: readDrawMode(),
    };
  }, [model]);

  const [nav, dispatch] = useReducer(reducer, init);

  const gotoScreen = useCallback(
    (id: string) => {
      const isScreen = model.screens.some((s) => s.id === id);
      const isModalTab = id.startsWith("modal:") && (model.modals || []).some((m) => m.id === id.slice(6));
      if (isScreen || isModalTab) dispatch({ type: "goto", id });
    },
    [model],
  );
  const setState = useCallback(
    (screenId: string, stateId: string) => dispatch({ type: "setState", screenId, stateId }),
    [],
  );
  const openModal = useCallback((id: string) => dispatch({ type: "openModal", id }), []);
  const closeModal = useCallback(() => dispatch({ type: "closeModal" }), []);
  const setMode = useCallback((mode: Mode) => dispatch({ type: "setMode", mode }), []);
  const setDrawMode = useCallback((drawMode: DrawMode) => dispatch({ type: "setDrawMode", drawMode }), []);

  return { nav, gotoScreen, setState, openModal, closeModal, setMode, setDrawMode };
}
