import { useEffect, useState } from 'react';
import { useAppState } from './lib/store';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatView from './components/ChatView';
import SearchModal from './components/SearchModal';
import SettingsModal from './components/SettingsModal';

declare global {
  interface Window {
    appWindow?: {
      platform: string;
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
      isMaximized?: () => Promise<boolean>;
      onMaximizedChange?: (cb: (v: boolean) => void) => void;
    };
  }
}

export default function App() {
  const api = useAppState();
  const { state, activeConversation, isStreaming } = api;
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isMac = window.appWindow?.platform === 'darwin';
  const isWindows = window.appWindow?.platform === 'win32';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        api.newChat();
      } else if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        api.toggleSidebar();
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-[#0d0d0d] antialiased dark:bg-[#212121] dark:text-[#ececec]">
      <Sidebar
        open={state.sidebarOpen}
        conversations={state.conversations}
        activeId={state.activeId}
        lang={state.lang}
        isMac={!!isMac}
        onNewChat={api.newChat}
        onOpenSearch={() => setSearchOpen(true)}
        onSelect={api.selectChat}
        onRename={api.renameChat}
        onDelete={api.deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggle={api.toggleSidebar}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <TopBar
          lang={state.lang}
          providers={state.providers}
          activeModel={state.activeModel}
          sidebarOpen={state.sidebarOpen}
          isMac={!!isMac}
          isWindows={!!isWindows}
          onToggleSidebar={api.toggleSidebar}
          onNewChat={api.newChat}
          onSetModel={api.setModel}
          onManageProviders={() => setSettingsOpen(true)}
        />
        <ChatView
          lang={state.lang}
          conversation={activeConversation}
          streaming={isStreaming}
          demo={state.activeModel.providerId === 'demo'}
          api={api}
        />
      </main>

      {searchOpen && (
        <SearchModal
          lang={state.lang}
          conversations={state.conversations}
          onClose={() => setSearchOpen(false)}
          onSelect={api.selectChat}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          lang={state.lang}
          theme={state.theme}
          providers={state.providers}
          onClose={() => setSettingsOpen(false)}
          onSetTheme={api.setTheme}
          onSetLang={api.setLang}
          onClearAll={api.clearAllChats}
          onUpdateProvider={api.updateProvider}
          onAddProvider={api.addProvider}
          onRemoveProvider={api.removeProvider}
        />
      )}
    </div>
  );
}
