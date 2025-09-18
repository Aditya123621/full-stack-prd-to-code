import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Priority, TaskFilters } from '@/types';

interface UiState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  taskFormOpen: boolean;
  categoryFormOpen: boolean;
  filters: TaskFilters;
  selectedTaskId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UiState = {
  theme: 'system',
  sidebarOpen: false,
  taskFormOpen: false,
  categoryFormOpen: false,
  filters: {},
  selectedTaskId: null,
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTaskFormOpen: (state, action: PayloadAction<boolean>) => {
      state.taskFormOpen = action.payload;
    },
    setCategoryFormOpen: (state, action: PayloadAction<boolean>) => {
      state.categoryFormOpen = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedTaskId: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setTaskFormOpen,
  setCategoryFormOpen,
  setFilters,
  clearFilters,
  setSelectedTaskId,
  setLoading,
  setError,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;
