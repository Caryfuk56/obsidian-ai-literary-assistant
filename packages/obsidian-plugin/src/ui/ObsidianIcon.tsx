import { setIcon } from "obsidian";
import { type ReactElement, useEffect, useRef } from "react";

/**
 * Renders an Obsidian-native Lucide icon inside React.
 */
export const ObsidianIcon = ({ icon }: { readonly icon: string }): ReactElement => {
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      iconRef.current.empty();
      setIcon(iconRef.current, icon);
    }
  }, [icon]);

  return <span aria-hidden="true" ref={iconRef} />;
};
