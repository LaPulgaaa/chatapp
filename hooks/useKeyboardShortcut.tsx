"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";

type KeyboardShortcutListener = {
  id: string;
  key: string | string[];
  enabled?: boolean;
  priority?: number;
  modal?: number;
};

const KeyboardShortcutContext = createContext<{
  listeners: KeyboardShortcutListener[];
  setListeners: Dispatch<SetStateAction<KeyboardShortcutListener[]>>;
}>({
  listeners: [],
  setListeners: () => {},
});

export const KeyboardShortcutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [listeners, setListeners] = useState<KeyboardShortcutListener[]>([]);
  return (
    <KeyboardShortcutContext.Provider value={{ listeners, setListeners }}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};

export function useKeyboardShortcut(
  key: KeyboardShortcutListener["key"],
  callback: (e: KeyboardEvent) => void,
  options: Pick<
    KeyboardShortcutListener,
    "enabled" | "modal" | "priority"
  > = {},
) {
  const id = useId();

  const { listeners, setListeners } = useContext(KeyboardShortcutContext);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (options.enabled === false) return;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const target = e.target as HTMLElement;

      // return if user is typing in an input or textarea element
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // meta: the command key in mac and window key on windows
      const keyPressed = [
        ...(e.altKey ? ["alt"] : []),
        ...(e.ctrlKey ? ["ctrl"] : []),
        ...(e.metaKey ? ["meta"] : []),
        e.key,
      ].join("+");

      if (Array.isArray(key) ? !key.includes(keyPressed) : keyPressed !== key)
        return;

      const matchingListeners = listeners.filter((l) => {
        if (
          l.enabled !== false &&
          (Array.isArray(l.key)
            ? l.key.includes(keyPressed)
            : l.key === keyPressed)
        )
          return l;
      });

      const topPriorityListener = matchingListeners.sort(
        (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
      )[0];

      // this listener is not the top priority for the key.
      if (topPriorityListener === undefined || topPriorityListener.id !== id)
        return;

      e.preventDefault();
      callback(e);
    },
    [key, listeners, callback, id, options.enabled],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    setListeners((prev) => [
      ...prev.filter((p) => p.id !== id),
      {
        key,
        id,
        ...options,
      },
    ]);

    return () => setListeners((prev) => prev.filter((p) => p.id !== id));
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(key)]);
}
