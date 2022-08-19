import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getUser, getRoles, updateUser, createUser, reset } from './user-management.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const UserManagementUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { login } = useParams<'login'>();
  const isNew = login === undefined;

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getUser(login));
    }
    dispatch(getRoles());
    return () => {
      dispatch(reset());
    };
  }, [login]);

  const handleClose = () => {
    navigate('/admin/user-management');
  };

  const saveUser = values => {
    if (isNew) {
      dispatch(createUser(values));
    } else {
      dispatch(updateUser(values));
    }
    handleClose();
  };

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
          {loading ? (
            <p>Loading...</p>
          ) : (
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
