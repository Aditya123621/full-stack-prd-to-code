import { configureStore } from '@reduxjs/toolkit';
import { tasksApi } from './api/tasksApi';
import { categoriesApi } from './api/categoriesApi';
import { userApi } from './api/userApi';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [tasksApi.reducerPath]: tasksApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    
    // Regular slices
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    })
      .concat(tasksApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(userApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
