import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getUser, getRoles, updateUser, createUser, reset } from './user-management.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const UserManagementUpdate = () => {
  // MANAGEMENT-NEW 3. MANAGEMENT-EDIT 3. dispatch(액션호출과 상태관리)와 navigate(url이동) 사용을 위해
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // MANAGEMENT-NEW 4. MANAGEMENT-EDIT 4. 현재 url의 login에 해당하는 객체를 반환
  const { login } = useParams<'login'>();
  // MANAGEMENT-NEW 5. 로그인 아이디가 undefined이면 isNew=TRUE(생성), 아니면 isNew=FALSE(수정) (사용자 생성은 그냥 /new 이므로 isNew는 True)
  // MANAGEMENT-EDIT 5. 수정은 /로그인아이디/edit 이므로 isNew가 False
  const isNew = login === undefined;

  // MANAGEMENT-NEW 6. MANAGEMENT-EDIT 6. login 값이 변경될 때 실행
  useEffect(() => {
    if (isNew) {
      // MANAGEMENT-NEW 7. 로그인 아이디가 undefined이면 reset 액션 호출(user-management.reducer.ts)
      dispatch(reset());
    } else {
      // MANAGEMENT-EDIT 7. 아니면 login을 파라미터로 getUser 액션 호출(user-management.reducer.ts)
      dispatch(getUser(login));
    }
    // MANAGEMENT-NEW 9. MANAGEMENT-EDIT 12. getRoles 액션 호출(user-management.reducer.ts)
    dispatch(getRoles());
    return () => {
      // MANAGEMENT-NEW 14. MANAGEMENT-EDIT 16. reset 액션 호출
      dispatch(reset());
    };
  }, [login]);

  const handleClose = () => {
    // MANAGEMENT-NEW 44 END. MANAGEMENT-EDIT 30 END. 해당 uri로 이동
    navigate('/admin/user-management');
  };

  // MANAGEMENT-NEW 18. MANAGEMENT-EDIT 19. 작성한 값들로 컴포넌트 실행
  const saveUser = values => {
    // MANAGEMENT-NEW 19. 사용자 생성이면
    if (isNew) {
      // MANAGEMENT-NEW 20. values를 파라미터로 createUser 액션 호출(user-management.reducer.ts)
      dispatch(createUser(values));
    } else {
      // MANAGEMENT-EDIT 20. valuse를 파라미터로 updateUser 액션 호출(user-management.reducer.ts)
      dispatch(updateUser(values));
    }
    // MANAGEMENT-NEW 43. MANAGEMENT-EDIT 29. handleClose 실행
    handleClose();
  };

  // MANAGEMENT-NEW 15. MANAGEMENT-EDIT 17. isInvalid는 false로 초기화, store에서 user, loading, updating, authorities 상태 정보를 가져옴
  const isInvalid = false;
  const user = useAppSelector(state => state.userManagement.user);
  const loading = useAppSelector(state => state.userManagement.loading);
  const updating = useAppSelector(state => state.userManagement.updating);
  const authorities = useAppSelector(state => state.userManagement.authorities);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>사용자 생성 또는 수정</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {/* MANAGEMENT-NEW 16. 로딩 상태 */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            // MANAGEMENT-NEW 17. form submit handler => saveUser
            // MANAGEMENT-EDIT 18. defaultValues 설정으로 유저 정보를 넣음
            <ValidatedForm onSubmit={saveUser} defaultValues={user}>
              {user.id ? <ValidatedField type="text" name="id" required readOnly label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                type="text"
                name="login"
                label="로그인 아이디"
                validate={{
                  required: {
                    value: true,
                    message: '아이디 입력이 필요합니다',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                    message: 'Your username is invalid.',
                  },
                  minLength: {
                    value: 1,
                    message: '아이디는 적어도 1자 이상이어야 합니다',
                  },
                  maxLength: {
                    value: 50,
                    message: '아이디는 최대 50자 까지입니다',
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="firstName"
                label="이름"
                validate={{
                  maxLength: {
                    value: 50,
                    message: '최대 50자 이하까지만 입력 가능합니다.',
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="lastName"
                label="성"
                validate={{
                  maxLength: {
                    value: 50,
                    message: '최대 50자 이하까지만 입력 가능합니다.',
                  },
                }}
              />
              <FormText>This field cannot be longer than 50 characters.</FormText>
              <ValidatedField
                name="email"
                label="이메일"
                placeholder="이메일을 입력하세요"
                type="email"
                validate={{
                  required: {
                    value: true,
                    message: '이메일 입력이 필요합니다.',
                  },
                  minLength: {
                    value: 5,
                    message: '이메일은 최소 5자 이상이어야 합니다',
                  },
                  maxLength: {
                    value: 254,
                    message: '이메일은 최대 50자 까지입니다.',
                  },
                  validate: v => isEmail(v) || '잘못된 이메일입니다.',
                }}
              />
              <ValidatedField type="checkbox" name="activated" check value={true} disabled={!user.id} label="활성" />
              <ValidatedField type="select" name="authorities" multiple label="Profiles">
                {authorities.map(role => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </ValidatedField>
              <Button tag={Link} to="/admin/user-management" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">뒤로</span>
              </Button>
              &nbsp;
              <Button color="primary" type="submit" disabled={isInvalid || updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; 저장
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default UserManagementUpdate;
