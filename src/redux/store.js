import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import appointmentReducers from './slices/appointmentSlice';
import reverseBiddingReducer from './slices/reverseBiddingSlice';
import persistReducer from 'redux-persist/es/persistReducer';
import { userPersistConfig } from './persistConfig';
import persistStore from 'redux-persist/es/persistStore';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

export const store = configureStore({
  reducer: {
    user: persistReducer(userPersistConfig, userReducer),
    appointments: appointmentReducers,
    reverseBidding: reverseBiddingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types (they use non-serializable payloads)
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: true,
});

export const persistor = persistStore(store);
export default store;