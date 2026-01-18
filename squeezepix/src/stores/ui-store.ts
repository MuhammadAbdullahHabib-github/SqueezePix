'use client';

import { create } from 'zustand';

interface UIStore {
  // Modal states
  isPreviewModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  isSettingsOpen: boolean;

  // Preview modal content
  previewImageId: string | null;

  // Processing state
  isProcessing: boolean;
  processingProgress: number;

  // Network state
  isOnline: boolean;

  // Actions
  openPreviewModal: (imageId: string) => void;
  closePreviewModal: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  toggleSettings: () => void;
  setProcessing: (isProcessing: boolean, progress?: number) => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial states
  isPreviewModalOpen: false,
  isUpgradeModalOpen: false,
  isSettingsOpen: false,
  previewImageId: null,
  isProcessing: false,
  processingProgress: 0,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,

  // Modal actions
  openPreviewModal: (imageId: string) => {
    set({ isPreviewModalOpen: true, previewImageId: imageId });
  },

  closePreviewModal: () => {
    set({ isPreviewModalOpen: false, previewImageId: null });
  },

  openUpgradeModal: () => {
    set({ isUpgradeModalOpen: true });
  },

  closeUpgradeModal: () => {
    set({ isUpgradeModalOpen: false });
  },

  toggleSettings: () => {
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
  },

  // Processing state
  setProcessing: (isProcessing: boolean, progress = 0) => {
    set({ isProcessing, processingProgress: progress });
  },

  // Network state
  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },
}));
