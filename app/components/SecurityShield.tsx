'use client';

import { useEffect } from 'react';

/**
 * SecurityShield — anti-debugging and tamper detection.
 * Only activates in production builds.
 */
export default function SecurityShield() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;

        // ─── Block context menu ───
        const blockContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('contextmenu', blockContextMenu);

        // ─── Block keyboard shortcuts ───
        const blockShortcuts = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') { e.preventDefault(); return false; }
            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
            // Ctrl+Shift+C (Element picker)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
            // Ctrl+U (View source)
            if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
            // Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
        };
        document.addEventListener('keydown', blockShortcuts);

        // ─── Console overrides ───
        const noop = () => { };
        const origConsole = { ...console };
        try {
            Object.defineProperties(console, {
                log: { value: noop, writable: false, configurable: false },
                warn: { value: noop, writable: false, configurable: false },
                info: { value: noop, writable: false, configurable: false },
                debug: { value: noop, writable: false, configurable: false },
                table: { value: noop, writable: false, configurable: false },
            });
        } catch {
            // Fail silently if console is frozen
        }

        // ─── DevTools detection via size delta ───
        let devToolsOpen = false;
        const overlay = document.createElement('div');
        overlay.id = 'ss-security-overlay';
        overlay.innerHTML = `
      <div style="
        position:fixed;inset:0;z-index:999999;
        display:flex;justify-content:center;align-items:center;
        background:rgba(10,5,20,0.97);
        font-family:'Poppins',sans-serif;color:#EF4444;
        flex-direction:column;gap:16px;text-align:center;
        backdrop-filter:blur(8px);
      ">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="1.5">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
        <h2 style="font-size:1.5rem;font-weight:700;margin:0;">Security Violation</h2>
        <p style="color:#9CA3AF;max-width:400px;font-size:0.9rem;line-height:1.6;">
          Developer tools detected. Close DevTools to continue using this application.
        </p>
      </div>
    `;

        const checkDevTools = () => {
            const widthDelta = window.outerWidth - window.innerWidth > 160;
            const heightDelta = window.outerHeight - window.innerHeight > 160;
            const isOpen = widthDelta || heightDelta;

            if (isOpen && !devToolsOpen) {
                devToolsOpen = true;
                document.body.appendChild(overlay);
            } else if (!isOpen && devToolsOpen) {
                devToolsOpen = false;
                overlay.remove();
            }
        };

        const devToolsInterval = setInterval(checkDevTools, 1000);

        // ─── Debugger trap (periodic) ───
        const debuggerInterval = setInterval(() => {
            const start = performance.now();
            // eslint-disable-next-line no-debugger
            debugger;
            const dur = performance.now() - start;
            if (dur > 100 && !devToolsOpen) {
                devToolsOpen = true;
                if (!document.getElementById('ss-security-overlay')) {
                    document.body.appendChild(overlay);
                }
            }
        }, 4000);

        // ─── Disable text selection on body ───
        const style = document.createElement('style');
        style.textContent = `
      body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
      input, textarea { -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; }
    `;
        document.head.appendChild(style);

        // ─── Prevent drag ───
        const blockDrag = (e: DragEvent) => e.preventDefault();
        document.addEventListener('dragstart', blockDrag);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', blockShortcuts);
            document.removeEventListener('dragstart', blockDrag);
            clearInterval(devToolsInterval);
            clearInterval(debuggerInterval);
            overlay.remove();
            style.remove();
            // Restore console
            try {
                Object.defineProperties(console, {
                    log: { value: origConsole.log, writable: true, configurable: true },
                    warn: { value: origConsole.warn, writable: true, configurable: true },
                    info: { value: origConsole.info, writable: true, configurable: true },
                    debug: { value: origConsole.debug, writable: true, configurable: true },
                    table: { value: origConsole.table, writable: true, configurable: true },
                });
            } catch { }
        };
    }, []);

    return null; // Invisible component
}
