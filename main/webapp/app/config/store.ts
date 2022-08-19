import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { loadingBarMiddleware } from 'react-redux-loading-bar';

import sharedReducers from 'app/shared/reducers';
import errorMiddleware from './error-middleware';
import notificationMiddleware from './notification-middleware';
import loggerMiddleware from './logger-middleware';

const store = configureStore({
  reducer: sharedReducers,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.config', 'payload.request', 'error', 'meta.arg'],
      },
    }).concat(errorMiddleware, notificationMiddleware, loadingBarMiddleware(), loggerMiddleware),
});

const getStore = () => store;

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// store를 가져오는 메소드
export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
// dispatch를 보내는 메소드, store.dispatch 타입으로
export const useAppDispatch = () => useDispatch<AppDispatch>();
// thunkaction은 커링패턴 -> 함수의 인자로 함수를 전달하고, 그 함수로 새로운 함수를 만드는 기법
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, IRootState, unknown, AnyAction>;

export default getStore;
