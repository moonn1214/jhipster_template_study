import axios, { AxiosResponse } from 'axios';
import { Storage } from 'react-jhipster';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { serializeAxiosError } from './reducer.utils';

import { AppThunk } from 'app/config/store';

const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

export const initialState = {
  loading: false,
  isAuthenticated: false,
  loginSuccess: false,
  loginError: false, // Errors returned from server side
  showModalLogin: false,
  account: {} as any,
  errorMessage: null as unknown as string, // Errors returned from server side
  redirectMessage: null as unknown as string,
  sessionHasBeenFetched: false,
  logoutUrl: null as unknown as string,
};

export type AuthenticationState = Readonly<typeof initialState>;

// Actions

// LOGIN 40. getAccount 액션 호출
// ?????? 응답 후 state를 어디서 변경하는지 (AccountResource.java에서 getmapping으로 뷰를 반환하지도 않고) 아래 AuthenticationSlice?
export const getSession = (): AppThunk => (dispatch, getState) => {
  dispatch(getAccount());
};

// LOGIN 41. axios(http 비동기 통신 라이브러리) 방식으로 get 방식, 'api/account'를 요청으로 보냄 (AccountResource.java)
export const getAccount = createAsyncThunk('authentication/get_account', async () => axios.get<any>('api/account'), {
  serializeError: serializeAxiosError,
});

interface IAuthParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// LOGIN 27. axios(http 비동기 통신 라이브러리) 방식으로 post 방식, 'api/authenticate'를 요청으로 보냄 (UserJWTController.java)
export const authenticate = createAsyncThunk(
  'authentication/login',
  async (auth: IAuthParams) => axios.post<any>('api/authenticate', auth),
  {
    serializeError: serializeAxiosError,
  }
);

// LOGIN 25. 로그인 메소드
// login.tsx 에서 넘겨받은 값을 사용
export const login: (username: string, password: string, rememberMe?: boolean) => AppThunk =
  (username, password, rememberMe = false) =>
  async dispatch => {
    // LOGIN 26. authenticate(axios 요청) 액션을 호출 후 응답을 result에 초기화
    const result = await dispatch(authenticate({ username, password, rememberMe }));
    // LOGIN 36. result의 payload를 AxiosResponse 타입으로 다운캐스팅
    const response = result.payload as AxiosResponse;
    // LOGIN 37. 
    // ?. => 옵셔널 체이닝 연산자, 프로퍼티가 없는(undefined, null) 객체를 에러 없이 안전하게 접근 가능(예외 처리)
    // "authorization":"Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqa21vb24iLCJhdXRoIjoiUk9MRV9VU0VSIiwiZXhwIjoxNjYwOTY3NDk2fQ.1F00EW9aM8rHGX_f4nmQj3SoDZtEb8VqtxGxhKv1xRtrjGtTza7SbVhXwBDTWXCmcPoXw11cLZvTBaNnr7Mqdw"
    const bearerToken = response?.headers?.authorization;
    // LOGIN 38. 유효한 권한인지 확인
    if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
      const jwt = bearerToken.slice(7, bearerToken.length);
      // 자동 로그인이 표시되어 있으면 로컬 스토리지에 AUTH_TOKEN_KEY로 authorization을 저장
      if (rememberMe) {
        Storage.local.set(AUTH_TOKEN_KEY, jwt);
      } else {
        // 표시되어 있지 않으면 세션 스토리지에 저장
        Storage.session.set(AUTH_TOKEN_KEY, jwt);
      }
    }
    // LOGIN 39. getSession 메소드 호출
    dispatch(getSession());
  };

export const clearAuthToken = () => {
  // LOGOUT 8. 로컬스토리지 또는 세션스토리지에 저장된 토큰을 삭제
  if (Storage.local.get(AUTH_TOKEN_KEY)) {
    Storage.local.remove(AUTH_TOKEN_KEY);
  }
  if (Storage.session.get(AUTH_TOKEN_KEY)) {
    Storage.session.remove(AUTH_TOKEN_KEY);
  }
};

// LOGOUT 6. logout 메소드 실행
export const logout: () => AppThunk = () => dispatch => {
  // LOGOUT 7. clearAuthToken 메소드 실행
  clearAuthToken();
  // LOGOUT 9. logoutSession 액션 호출
  dispatch(logoutSession());
};

export const clearAuthentication = messageKey => dispatch => {
  clearAuthToken();
  dispatch(authError(messageKey));
  dispatch(clearAuth());
};

// LOGIN 46. index.ts에 의해 해당 액션 실행
export const AuthenticationSlice = createSlice({
  name: 'authentication',
  initialState: initialState as AuthenticationState,
  reducers: {
    logoutSession() {
      return {
        // LOGOUT 10. state를 초기 값으로 세팅, showModalLogin은 true로 리턴(초기세팅은 false)
        ...initialState,
        showModalLogin: true,
      };
    },
    authError(state, action) {
      return {
        ...state,
        showModalLogin: true,
        redirectMessage: action.payload,
      };
    },
    clearAuth(state) {
      return {
        ...state,
        loading: false,
        showModalLogin: true,
        isAuthenticated: false,
      };
    },
  },
  // LOGIN 47 END. get방식 요청의 응답으로 state가 설정됨
  extraReducers(builder) {
    builder
      .addCase(authenticate.rejected, (state, action) => ({
        ...initialState,
        errorMessage: action.error.message,
        showModalLogin: true,
        loginError: true,
      }))
      .addCase(authenticate.fulfilled, state => ({
        ...state,
        loading: false,
        loginError: false,
        showModalLogin: false,
        loginSuccess: true,
      }))
      .addCase(getAccount.rejected, (state, action) => ({
        ...state,
        loading: false,
        isAuthenticated: false,
        sessionHasBeenFetched: true,
        showModalLogin: true,
        errorMessage: action.error.message,
      }))
      .addCase(getAccount.fulfilled, (state, action) => {
        const isAuthenticated = action.payload && action.payload.data && action.payload.data.activated;
        return {
          ...state,
          isAuthenticated,
          loading: false,
          sessionHasBeenFetched: true,
          account: action.payload.data,
        };
      })
      .addCase(authenticate.pending, state => {
        state.loading = true;
      })
      .addCase(getAccount.pending, state => {
        state.loading = true;
      });
  },
});

export const { logoutSession, authError, clearAuth } = AuthenticationSlice.actions;

// Reducer
export default AuthenticationSlice.reducer;
