import type { CSSProperties } from "react";

export type IconName = "book" | "search" | "arrow" | "shield" | "screen" | "chat" | "chart" | "clock" | "check" | "play";
const paths: Record<IconName, React.ReactNode> = {
  book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/></>,
  search: <><circle cx="10.75" cy="10.75" r="6.75"/><path d="m15.75 15.75 5 5"/></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
  screen: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-5-9 3-3 3 3 4-5"/></>,
  chat: <><path d="M20 11a8 8 0 0 1-8 8H4l-2 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h8m-8 4h5"/></>,
  chart: <><path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  play: <path d="m9 5 10 7-10 7V5Z"/>,
};
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "search" ? 2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={style}>{paths[name]}</svg>;
}
