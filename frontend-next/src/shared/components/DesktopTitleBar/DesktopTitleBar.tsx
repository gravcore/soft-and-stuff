import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import styles from "./DesktopTitleBar.module.css";
// getCurrentWindow = returns the current Tauri window instance so we can call minimize/maximize/close

let appWindow: Window | null = null; // WebviewWindow = the Tauri type for the window instance, so TypeScript knows what appWindow can be

// call getCurrentWindow() if we are inside Tauri
if ('__TAURI_INTERNALS__' in window) {
  appWindow = getCurrentWindow()
}

export function DesktopTitleBar() {
    return (
        <div className={ styles.titleBar } data-tauri-drag-region>
            <button className={ styles.minimizeBtn } onClick={() => appWindow?.minimize()}>_</button>
            <button className={ styles.toggleMaximizeBtn } onClick={() => appWindow?.toggleMaximize()}>□</button>
            <button className={ styles.closeBtn } onClick={() => appWindow?.close()}>✕</button>
        </div>
    );
}