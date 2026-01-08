import { useState, useEffect } from "react";
import { Plus, Wifi } from "lucide-react";
import { BrowserTab } from "@/components/BrowserTab";
import { AddressBar } from "@/components/AddressBar";
import { NewTabContent } from "@/components/NewTabContent";
import { SettingsDialog } from "@/components/SettingsDialog";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

interface Tab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
}

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", title: "New Tab", url: "", history: [""], historyIndex: 0, isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId)!;

  // Add new tab
  const addTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setTabs([...tabs, { 
      id: newId, 
      title: "New Tab", 
      url: "", 
      history: [""], 
      historyIndex: 0, 
      isLoading: false 
    }]);
    setActiveTabId(newId);
  };

  // Close tab
  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // If closing last tab, reset it instead
      setTabs([{ 
        id: Math.random().toString(36).substr(2, 9), 
        title: "New Tab", 
        url: "", 
        history: [""], 
        historyIndex: 0, 
        isLoading: false 
      }]);
      return;
    }
    
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    
    // If closed active tab, switch to the one before it
    if (id === activeTabId) {
      const index = tabs.findIndex((t) => t.id === id);
      const newActiveIndex = Math.max(0, index - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  // Navigation Logic
  const handleNavigate = (url: string) => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const newHistory = [...t.history.slice(0, t.historyIndex + 1), url];
        return {
          ...t,
          url,
          title: url, // Simplified: use URL as title initially
          isLoading: true,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return t;
    }));
  };

  const handleIframeLoad = (id: string) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, isLoading: false } : t));
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden fixed inset-0">
      {/* Tab Bar */}
      <div className="flex items-center px-2 pt-2 gap-1 bg-black/40 backdrop-blur-sm border-b border-white/5 overflow-x-auto scrollbar-hide z-50 safe-top">
        <AnimatePresence mode='popLayout'>
          {tabs.map((tab) => (
            <BrowserTab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              isActive={tab.id === activeTabId}
              isLoading={tab.isLoading}
              onActivate={() => setActiveTabId(tab.id)}
              onClose={(e) => closeTab(e, tab.id)}
            />
          ))}
        </AnimatePresence>
        
        <button
          onClick={addTab}
          className="p-2 ml-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Address Bar */}
      <AddressBar
        url={activeTab.url}
        isLoading={activeTab.isLoading}
        onNavigate={handleNavigate}
        onRefresh={() => handleNavigate(activeTab.url)}
        onBack={() => {
          if (activeTab.historyIndex > 0) {
            const newIndex = activeTab.historyIndex - 1;
            updateTab(activeTabId, { 
              historyIndex: newIndex, 
              url: activeTab.history[newIndex],
              isLoading: true 
            });
          }
        }}
        onForward={() => {
          if (activeTab.historyIndex < activeTab.history.length - 1) {
            const newIndex = activeTab.historyIndex + 1;
            updateTab(activeTabId, { 
              historyIndex: newIndex, 
              url: activeTab.history[newIndex],
              isLoading: true 
            });
          }
        }}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative bg-secondary/30">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 w-full h-full flex flex-col",
              tab.id === activeTabId ? "visible z-10" : "invisible z-0"
            )}
          >
            {tab.url ? (
              <iframe
                src={`/api/proxy?url=${encodeURIComponent(tab.url)}`}
                className="w-full h-full border-none bg-white"
                onLoad={() => handleIframeLoad(tab.id)}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <NewTabContent onSearch={handleNavigate} />
            )}
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-primary/5 border-t border-white/5 flex items-center justify-between px-3 text-[10px] text-muted-foreground uppercase tracking-wider font-mono select-none z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Connected to US-East-1
          </span>
          <span>Latency: 24ms</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3" />
          <span>Secure Connection</span>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
