import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  registrationSuccess: false,
  registrationFailure: false,
  errorMessage: null,
  successMessage: null,
};

export type RegisterState = Readonly<typeof initialState>;

// Actions

// (수정)정리
// 1. dispatch를 사용하여 액션을 호출
// 2. createAsyncThunk로 생성한 액션이 호출되어 실행
// 3. extraReducers에서 케이스마다 상태를 변경하도록 설정되어 있어서 프로미스의 진행 상태에 따라 리듀서를 실행할 수 있음
// 4. 즉 register.tsx에서 handleRegister 액션을 dispatch하여 실행이 되고, 액션 실행 상태에 따라 리듀서가 실행되어 store 내의 값 상태가 변경됨

// REGISTER 14. register.tsx에서 받은 값(아이디, 이메일, 패스워드)으로 해당 액션 실행
// axios(http 비동기 통신 라이브러리) 방식으로 post 방식, 'api/register'를 요청으로 보냄 (AccountResource.java)
// (수정)createAsyncThunk => 생성한 액션에 대해 pending, fulfilled, rejected 상태에 대한 액션을 자동 생성해줌
export const handleRegister = createAsyncThunk(
  'register/create_account',
  async (data: { login: string; email: string; password: string; langKey?: string }) => axios.post<any>('api/register', data),
  { serializeError: serializeAxiosError }
);

// REGISTER 71. index.ts에 의해 register 액션 실행 -> (수정)아님
// (수정)createSlice => 액션과 리듀서를 같이 생성
export const RegisterSlice = createSlice({
  name: 'register',
  // REGISTER 72. state를 초기 값을 설정
  initialState: initialState as RegisterState,
  reducers: {
    // REGISTER 73. reset 메소드 호출 시 초기 state 리턴 (register.tsx에서 호출함) -> (수정)이게 아니라 제일 아래 reset, 즉 RegisterSlice의 액션 (결국 이것도 포함)
    reset() {
      return initialState;
    },
  },
  // REGISTER 74. state 값을 설정
  // (수정)extraReducers => createSlice 블록 외의 외부 작업을 참조하여 상태를 설정
  extraReducers(builder) {
    builder
      .addCase(handleRegister.pending, state => {
        state.loading = true;
      })
      .addCase(handleRegister.rejected, (state, action) => ({
        ...initialState,
        registrationFailure: true,
        errorMessage: action.error.message,
      }))
      // REGISTER 75 END. 등록 성공 메세지 설정으로 register.tsx 두번째 useEffect에서 출력하고 등록 완료
      .addCase(handleRegister.fulfilled, () => ({
        ...initialState,
        registrationSuccess: true,
        successMessage: 'Registration saved! Please check your email for confirmation.',
      }));
  },
});

export const { reset } = RegisterSlice.actions;

// Reducer
export default RegisterSlice.reducer;
