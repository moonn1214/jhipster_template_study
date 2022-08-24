import axios from 'axios';
import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  resetPasswordSuccess: false,
  resetPasswordFailure: false,
  successMessage: null,
};

export type PasswordResetState = Readonly<typeof initialState>;

const apiUrl = 'api/account/reset-password';
// Actions

// REQUEST 8. createAsyncThunk로 액션을 생성했기 때문에, 해당 액션에 대해 pending, fulfilled, rejected 상태에 대한 액션이 자동 생성됨
export const handlePasswordResetInit = createAsyncThunk(
  // 액션명
  'passwordReset/reset_password_init',
  // If the content-type isn't set that way, axios will try to encode the body and thus modify the data sent to the server.
  // REQUEST 9. 파라미터로 넘어온 값을 mail로 받아서 함수 실행
  // axios http 비동기 통신, post 방식의 요청을 보냄, 요청 파라미터는 요청url, mail, headers
  async (mail: string) => axios.post(`${apiUrl}/init`, mail, { headers: { ['Content-Type']: 'text/plain' } }),
  // 에러 처리 reducer.utils.ts의 serializeAxiosError를 사용
  { serializeError: serializeAxiosError }
);

export const handlePasswordResetFinish = createAsyncThunk(
  'passwordReset/reset_password_finish',
  async (data: { key: string; newPassword: string }) => axios.post(`${apiUrl}/finish`, data),
  { serializeError: serializeAxiosError }
);

export const PasswordResetSlice = createSlice({
  name: 'passwordReset',
  initialState: initialState as PasswordResetState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  // REQUEST 18 END. handlePasswordResetInit 액션의 실행 상태에 따라 상태 변경
  extraReducers(builder) {
    builder
      .addCase(handlePasswordResetInit.fulfilled, () => ({
        ...initialState,
        loading: false,
        resetPasswordSuccess: true,
        successMessage: 'Check your emails for details on how to reset your password.',
      }))
      .addCase(handlePasswordResetFinish.fulfilled, () => ({
        ...initialState,
        loading: false,
        resetPasswordSuccess: true,
        successMessage: "Your password couldn't be reset. Remember a password request is only valid for 24 hours.",
      }))
      .addMatcher(isPending(handlePasswordResetInit, handlePasswordResetFinish), state => {
        state.loading = true;
      })
      .addMatcher(isRejected(handlePasswordResetInit, handlePasswordResetFinish), () => ({
        ...initialState,
        loading: false,
        resetPasswordFailure: true,
      }));
  },
});

export const { reset } = PasswordResetSlice.actions;

// Reducer
export default PasswordResetSlice.reducer;
