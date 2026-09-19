"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_LAYOUT, MAX_STREAMS } from "@/lib/config";

const MultiViewContext = createContext(null);

const STORAGE_KEY = "streamview_selected_streams";
const LAYOUT_STORAGE_KEY = "streamview_active_layout";

export function MultiViewProvider({ children }) {
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [activeLayout, setActiveLayout] = useState(DEFAULT_LAYOUT);
  const [activeReferenceIndex, setActiveReferenceIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerFilter, setActiveDrawerFilter] = useState("");
  const [maximizedStreamId, setMaximizedStreamId] = useState(null);
  const [targetSlotIndex, setTargetSlotIndex] = useState(null);
  const [viewMode, setViewMode] = useState("stage");
  const [activeAudioId, setActiveAudioId] = useState(null);

  useEffect(() => {
    try {
      const savedStreams = localStorage.getItem(STORAGE_KEY);
      if (savedStreams) {
        const parsed = JSON.parse(savedStreams);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedStreams(parsed.slice(0, MAX_STREAMS));
        }
      }

      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        const layoutNum = parseInt(savedLayout, 10);
        if ([1, 2, 3, 4, 6].includes(layoutNum)) {
          setActiveLayout(layoutNum);
        }
      }
    } catch (e) {
      console.warn("Could not load stored multi-view state", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStreams));
    } catch (e) {}
  }, [selectedStreams]);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, String(activeLayout));
    } catch (e) {}
  }, [activeLayout]);

  useEffect(() => {
    if (selectedStreams.length === 0) return;

    const refreshStreams = () => {
      selectedStreams.forEach(async (stream) => {
        if (stream.platform === "youtube") return;
        try {
          const res = await fetch(`/api/kick/channel?name=${encodeURIComponent(stream.channelName)}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              const { avatarUrl, viewerCount, title, category } = json.data;
              setSelectedStreams((prev) =>
                prev.map((s) => {
                  if (s.channelName.toLowerCase() === stream.channelName.toLowerCase()) {
                    const newAvatar = avatarUrl || s.avatarUrl;
                    const newCount = viewerCount !== undefined && viewerCount !== null ? viewerCount : s.viewerCount;
                    const newTitle = title || s.title;
                    const newCategory = category || s.category;

                    const hasChanged =
                      (avatarUrl && avatarUrl !== s.avatarUrl) ||
                      (viewerCount !== undefined && viewerCount !== null && viewerCount !== s.viewerCount) ||
                      (title && title !== s.title) ||
                      (category && category !== s.category);

                    if (hasChanged) {
                      return {
                        ...s,
                        avatarUrl: newAvatar,
                        viewerCount: newCount,
                        title: newTitle,
                        category: newCategory,
                      };
                    }
                  }
                  return s;
                })
              );
            }
          }
        } catch (e) {}
      });
    };

    refreshStreams();

    const interval = setInterval(refreshStreams, 30000);
    return () => clearInterval(interval);
  }, [selectedStreams.map((s) => s.id || s.channelName).join(",")]);

  const addStream = (stream) => {
    if (!stream) return false;

    if (
      selectedStreams.some((s) => {
        if (stream.platform === "youtube" || s.platform === "youtube") {
          return (
            s.id === stream.id ||
            (stream.youtubeVideoId && s.youtubeVideoId === stream.youtubeVideoId)
          );
        }
        return s.channelName.toLowerCase() === stream.channelName.toLowerCase();
      })
    ) {
      return false;
    }

    if (targetSlotIndex !== null && targetSlotIndex < selectedStreams.length) {
      setSelectedStreams(prev => {
        const updated = [...prev];
        updated[targetSlotIndex] = stream;
        return updated;
      });
      setTargetSlotIndex(null);
      return true;
    }

    if (selectedStreams.length >= activeLayout) {
      if (activeLayout === 1) setActiveLayout(2);
      else if (activeLayout === 2) setActiveLayout(4);
      else if (activeLayout === 3) setActiveLayout(4);
      else if (activeLayout === 4) setActiveLayout(6);
    }

    if (selectedStreams.length >= MAX_STREAMS) {
      return false;
    }

    setSelectedStreams(prev => [...prev, stream]);
    return true;
  };

  const removeStream = (streamId) => {
    setSelectedStreams(prev => prev.filter(s => s.id !== streamId && s.channelName !== streamId));
    if (maximizedStreamId === streamId) {
      setMaximizedStreamId(null);
    }
    if (activeAudioId === streamId) {
      setActiveAudioId(null);
    }
  };

  const openDrawer = ({ referenceIndex = 0, filter = "", slotIndex = null } = {}) => {
    setActiveReferenceIndex(referenceIndex);
    setActiveDrawerFilter(filter);
    setTargetSlotIndex(slotIndex);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setActiveDrawerFilter("");
    setTargetSlotIndex(null);
  };

  const toggleMaximizeStream = (streamId) => {
    setMaximizedStreamId(prev => (prev === streamId ? null : streamId));
  };

  const clearAllStreams = () => {
    setSelectedStreams([]);
    setMaximizedStreamId(null);
    setActiveAudioId(null);
  };

  const focusStream = (streamId) => {
    setSelectedStreams(prev => {
      const idx = prev.findIndex(s => s.id === streamId || s.channelName === streamId);
      if (idx <= 0) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      updated.unshift(moved);
      return updated;
    });
    setActiveReferenceIndex(0);
  };

  const activeReferenceStream = selectedStreams[activeReferenceIndex] || selectedStreams[0] || null;

  return (
    <MultiViewContext.Provider
      value={{
        selectedStreams,
        setSelectedStreams,
        activeLayout,
        setActiveLayout,
        activeReferenceIndex,
        setActiveReferenceIndex,
        activeReferenceStream,
        isDrawerOpen,
        activeDrawerFilter,
        maximizedStreamId,
        targetSlotIndex,
        viewMode,
        setViewMode,
        activeAudioId,
        setActiveAudioId,
        focusStream,
        addStream,
        removeStream,
        openDrawer,
        closeDrawer,
        toggleMaximizeStream,
        clearAllStreams,
      }}
    >
      {children}
    </MultiViewContext.Provider>
  );
}

export function useMultiView() {
  const context = useContext(MultiViewContext);
  if (!context) {
    throw new Error("useMultiView must be used within a MultiViewProvider");
  }
  return context;
}
