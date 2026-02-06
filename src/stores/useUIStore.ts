import { create } from 'zustand';

interface UIState {
  isScrolled: boolean;
  activeSection: string;
  isMobileMenuOpen: boolean;
  setScrolled: (scrolled: boolean) => void;
  setActiveSection: (section: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isScrolled: false,
  activeSection: 'home',
  isMobileMenuOpen: false,
  setScrolled: (scrolled) => set({ isScrolled: scrolled }),
  setActiveSection: (section) => set({ activeSection: section }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));
