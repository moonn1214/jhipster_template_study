import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  errorMessage: null,
  successMessage: null,
  updateSuccess: false,
  updateFailure: false,
};

export type PasswordState = Readonly<typeof initialState>;

const apiUrl = 'api/account';

interface IPassword {
  currentPassword: string;
  newPassword: string;
}

// Actions

// PASSWORD 16. currentPassword, newPassword를 받아서 실행
export const savePassword = createAsyncThunk(
  'password/update_password',
  // PASSWORD 17. axios(http 비동기 통신 라이브러리) 방식으로 post 방식, 'api/account/change-password'를 요청으로 보냄 (AccountResource.java)
  // currentPassword와 newPassword를 IPassword에 담아서 요청으로 넘김
  async (password: IPassword) => axios.post(`${apiUrl}/change-password`, password),
  { serializeError: serializeAxiosError }
);

// PASSWORD 30. index.ts에 의해 password 액션 실행
export const PasswordSlice = createSlice({
  name: 'password',
  initialState: initialState as PasswordState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  // PASSWORD 31 END. savePassword 액션의 상태에 따라 state 설정
  extraReducers(builder) {
    builder
      .addCase(savePassword.pending, state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addCase(savePassword.rejected, state => {
        state.loading = false;
        state.updateSuccess = false;
        state.updateFailure = true;
        state.errorMessage = 'An error has occurred! The password could not be changed.';
      })
      .addCase(savePassword.fulfilled, state => {
        state.loading = false;
        state.updateSuccess = true;
        state.updateFailure = false;
        state.successMessage = 'Password changed!';
      });
  },
});

export const { reset } = PasswordSlice.actions;

// Reducer
export default PasswordSlice.reducer;
