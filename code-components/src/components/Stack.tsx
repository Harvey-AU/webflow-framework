import type { CSSProperties, ReactNode } from "react";
import { tokenValue, type AlignmentOption } from "@/src/tokens";

/**
 * v3 Stack — vertical flex column. Spacing between children comes from
 * Spacer blocks, not a gap: deliberate, so spacing is visible in the tree
 * (component-spec.md). One setting: horizontal alignment of children.
 */
export type StackProps = {
  alignment?: AlignmentOption;
  children?: ReactNode;
};

const STACK_CSS = `
.stack {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
}
/* Dissolve Webflow's single slot wrapper so each dropped element is its own
   flex item (see code-conventions.md, slot DOM). No-op in local preview. */
::slotted([slot]) { display: contents; }
`;

export function Stack({ alignment = "stretch", children }: StackProps) {
  const style: CSSProperties = {
    alignItems: tokenValue("alignment", alignment),
  };
  return (
    <div className="stack" style={style}>
      <style>{STACK_CSS}</style>
      {children}
    </div>
  );
}
