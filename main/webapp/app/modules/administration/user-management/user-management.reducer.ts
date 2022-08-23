import axios from 'axios';
import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';

import { IUser, defaultValue } from 'app/shared/model/user.model';
import { IQueryParams, serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  errorMessage: null,
  users: [] as ReadonlyArray<IUser>,
  authorities: [] as any[],
  user: defaultValue,
  updating: false,
  updateSuccess: false,
  totalItems: 0,
};

const apiUrl = 'api/users';
const adminUrl = 'api/admin/users';

// Async Actions

export const getUsers = createAsyncThunk('userManagement/fetch_users', async ({ page, size, sort }: IQueryParams) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return axios.get<IUser[]>(requestUrl);
});

// MANAGEMENT 13. 현재페이지-1, 페이지당 항목 수, 정렬 기준과 방식을 넘겨받음
export const getUsersAsAdmin = createAsyncThunk('userManagement/fetch_users_as_admin', async ({ page, size, sort }: IQueryParams) => {
  const requestUrl = `${adminUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  // axios get방식으로 요청함, 요청 url : api/admin/users?page=값&size=값&sort=값 또는 api/admin/users (UserResource.java), page/size/sort를 파라미터로 넘김
  // MANAGEMENT 23. get 방식 요청 응답이 반환됨
  /* new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK) : 
    <200 OK OK,[AdminUserDTO{
                  login='admin', 
                  firstName='Administrator', 
                  lastName='Administrator', 
                  email='admin@localhost', 
                  imageUrl='', 
                  activated=true, 
                  langKey='ko', 
                  createdBy=system, 
                  createdDate=null, 
                  lastModifiedBy='system', 
                  lastModifiedDate=null, 
                  authorities=[ROLE_USER, ROLE_ADMIN]}, 등 모든 유저의 정보
                ],[X-Total-Count:"2", Link:"<http://localhost:8080/api/admin/users?sort=id%2Casc&page=0&size=20>; 
                  rel="last",<http://localhost:8080/api/admin/users?sort=id%2Casc&page=0&size=20>; rel="first""]> */
  return axios.get<IUser[]>(requestUrl);
});

export const getRoles = createAsyncThunk('userManagement/fetch_roles', async () => {
  // MANAGEMENT-NEW 10. axios get 통신 요청 (PublicUserResource.java)
  // MANAGEMENT-NEW 13. 권한 리스트가 리턴됨
  return axios.get<any[]>(`api/authorities`);
});

export const getUser = createAsyncThunk(
  'userManagement/fetch_user',
  async (id: string) => {
    // MANAGEMENT-DETAIL 6. id => 넘겨 받은 로그인 아이디로 요청 url 생성
    const requestUrl = `${adminUrl}/${id}`;
    // MANAGEMENT-DETAIL 7. axios get 방식 통신, 요청을 보냄 (UserResource.java)
    // MANAGEMENT-DETAIL 11. 응답 body에는 권한 있는 유저 객체와 상태 코드가 리턴됨
    return axios.get<IUser>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createUser = createAsyncThunk(
  'userManagement/create_user',
  async (user: IUser, thunkAPI) => {
    // MANAGEMENT-NEW 21. axios post 요청 방식, requesturl: 'api/admin/users', 작성된 유저의 정보를 파라미터로 요청(UserResource.java)
    // MANAGEMENT-NEW 40. result에 responseEntity 할당
    const result = await axios.post<IUser>(adminUrl, user);
    // MANAGEMENT-NEW 41. getUsersAsAdmin 액션 호출
    thunkAPI.dispatch(getUsersAsAdmin({}));
    // MANAGEMENT-NEW 42. result 리턴
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateUser = createAsyncThunk(
  'userManagement/update_user',
  // MANAGEMENT 37. user 정보와 상태 정보로 실행
  async (user: IUser, thunkAPI) => {
    // MANAGEMENT 38. axios 통신 put 메소드로 요청을 보냄, 요청 url : api/admin/users, user 정보를 파라미터로 넘김(UserResource.java)
    // MANAGEMENT 46. 응답을 result에 할당
    const result = await axios.put<IUser>(adminUrl, user);
    // MANAGEMENT 47. getUserAsAdmin 액션을 호출하여 모든 유저 조회
    thunkAPI.dispatch(getUsersAsAdmin({}));
    // MANAGEMENT 48. 응답 리턴
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteUser = createAsyncThunk(
  'userManagement/delete_user',
  async (id: string, thunkAPI) => {
    const requestUrl = `${adminUrl}/${id}`;
    const result = await axios.delete<IUser>(requestUrl);
    thunkAPI.dispatch(getUsersAsAdmin({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export type UserManagementState = Readonly<typeof initialState>;

// MANAGEMENT 54 END. user 정보 및 항목 수 등 index.ts에 의해 실행되어 state 관리됨
export const UserManagementSlice = createSlice({
  name: 'userManagement',
  initialState: initialState as UserManagementState,
  reducers: {
    // MANAGEMENT-NEW 8. 초기 상태 설정
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getRoles.fulfilled, (state, action) => {
        state.authorities = action.payload.data;
      })
      // MANAGEMENT-DETAIL 12. index.ts에 의해 실행되어 계속 상태가 변경되는 듯, 그래서 MANAGEMENT-DETAIL 13 에서도 user의 state를 가져와서 사용 가능한 듯
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(deleteUser.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.user = defaultValue;
      })
      .addMatcher(isFulfilled(getUsers, getUsersAsAdmin), (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalItems = parseInt(action.payload.headers['x-total-count'], 10);
      })
      .addMatcher(isFulfilled(createUser, updateUser), (state, action) => {
        state.updating = false;
        state.loading = false;
        state.updateSuccess = true;
        state.user = action.payload.data;
      })
      .addMatcher(isPending(getUsers, getUsersAsAdmin, getUser), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(isPending(createUser, updateUser, deleteUser), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.updating = true;
      })
      .addMatcher(isRejected(getUsers, getUsersAsAdmin, getUser, getRoles, createUser, updateUser, deleteUser), (state, action) => {
        state.loading = false;
        state.updating = false;
        state.updateSuccess = false;
        state.errorMessage = action.error.message;
      });
  },
});

export const { reset } = UserManagementSlice.actions;

// Reducer
export default UserManagementSlice.reducer;
