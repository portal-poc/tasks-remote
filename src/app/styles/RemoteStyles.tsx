import { GlobalStyles } from '@portal/ds';

/** Local view-transition classes (the host owns route-level transitions). 150–250 ms, off under reduced motion. */
const VIEW_TRANSITION_CSS = `
  ::view-transition-new(.tasks-item-enter) { animation: tasks-item-in 220ms ease-out both; }
  ::view-transition-old(.tasks-item-exit) { animation: tasks-item-out 150ms ease-in both; }
  @keyframes tasks-item-in { from { opacity: 0; transform: translateY(-8px); } }
  @keyframes tasks-item-out { to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  }
`;

export const RemoteStyles = () => <GlobalStyles styles={VIEW_TRANSITION_CSS} />;
