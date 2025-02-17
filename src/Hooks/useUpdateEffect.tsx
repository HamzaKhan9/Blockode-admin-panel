import { useEffect, useRef } from "react";

/**
 * This hook ignores the first invocation on mount
 *
 * @param effect
 * @param deps
 */
export const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      effect();
    } else {
      didMount.current = true;
    }
  }, deps);
};
