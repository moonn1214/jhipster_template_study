import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getSession } from 'app/shared/reducers/authentication';
import { AppThunk } from 'app/config/store';
import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  errorMessage: null,
  successMessage: null,
  updateSuccess: false,
  updateFailure: false,
};

export type SettingsState = Readonly<typeof initialState>;

// Actions
const apiUrl = 'api/account';

// SETTINGS 15. settings.tsx 계정 정보와 value 값들을 받아서 실행 
export const saveAccountSettings: (account: any) => AppThunk = account => async dispatch => {
  // SETTINGS 16. 계정 정보를 파라미터로 updateAccount 메소드 호출
  await dispatch(updateAccount(account));

  dispatch(getSession());
};

// SETTINGS 17. axios(http 비동기 통신 라이브러리) 방식으로 post 방식, 'api/account'와 account(계정 정보)를 요청으로 보냄 (AccountResource.java)
export const updateAccount = createAsyncThunk('settings/update_account', async (account: any) => axios.post<any>(apiUrl, account), {
  serializeError: serializeAxiosError,
});

// SETTINGS 28. index.ts에 의해 settings 액션이 실행
export const SettingsSlice = createSlice({
  name: 'settings',
  // SETTINGS 29. state 초기값 설정 
  initialState: initialState as SettingsState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  // SETTINGS 30. state 값 설정
  extraReducers(builder) {
    builder
      .addCase(updateAccount.pending, state => {
        state.loading = true;
        state.errorMessage = null;
        state.updateSuccess = false;
      })
      .addCase(updateAccount.rejected, state => {
        state.loading = false;
        state.updateSuccess = false;
        state.updateFailure = true;
      })
      // SETTINGS 31 END. 설정 완료 메세지 설정으로 settings.tsx의 두번째 useEffect에서 출력하고 설정 완료
      .addCase(updateAccount.fulfilled, state => {
        state.loading = false;
        state.updateSuccess = true;
        state.updateFailure = false;
        state.successMessage = 'Settings saved!';
      });
  },
});

export const { reset } = SettingsSlice.actions;

// Reducer
export default SettingsSlice.reducer;
