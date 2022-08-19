import React, { useState, useEffect } from 'react';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Row, Col, Alert, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { handleRegister, reset } from './register.reducer';

export const RegisterPage = () => {
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      dispatch(reset());
    },
    []
  );

  const handleValidSubmit = ({ username, email, firstPassword }) => {
    dispatch(handleRegister({ login: username, email, password: firstPassword, langKey: 'en' }));
  };

  const updatePassword = event => setPassword(event.target.value);

  const successMessage = useAppSelector(state => state.register.successMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1 id="register-title" data-cy="registerTitle">
            등록
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          <ValidatedForm id="register-form" onSubmit={handleValidSubmit}>
            <ValidatedField
              name="username"
              label="로그인 아이디"
              placeholder="로그인 아이디"
              validate={{
                required: { value: true, message: '아이디 입력이 필요합니다' },
                pattern: {
                  value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                  message: 'Your username is invalid.',
                },
                minLength: { value: 1, message: '아이디는 적어도 1자 이상이어야 합니다' },
                maxLength: { value: 50, message: '아이디는 최대 50자 까지입니다' },
              }}
              data-cy="username"
            />
            <ValidatedField
              name="email"
              label="이메일"
              placeholder="이메일을 입력하세요"
              type="email"
              validate={{
                required: { value: true, message: '이메일 입력이 필요합니다.' },
                minLength: { value: 5, message: '이메일은 최소 5자 이상이어야 합니다' },
                maxLength: { value: 254, message: '이메일은 최대 50자 까지입니다.' },
                validate: v => isEmail(v) || '잘못된 이메일입니다.',
              }}
              data-cy="email"
            />
            <ValidatedField
              name="firstPassword"
              label="새 비밀번호"
              placeholder="새 비밀번호"
              type="password"
              onChange={updatePassword}
              validate={{
                required: { value: true, message: '비밀번호 입력이 필요합니다.' },
                minLength: { value: 4, message: '비밀번호는 최소 4자 이상이어야 합니다' },
                maxLength: { value: 50, message: '비밀번호는 최대 50자 까지입니다.' },
              }}
              data-cy="firstPassword"
            />
            <PasswordStrengthBar password={password} />
            <ValidatedField
              name="secondPassword"
              label="새 비밀번호 확인"
              placeholder="새 비밀번호 확인"
              type="password"
              validate={{
                required: { value: true, message: '확인할 비밀번호 입력이 필요합니다.' },
                minLength: { value: 4, message: '확인할 비밀번호는 최소 4자 이상이어야 합니다' },
                maxLength: { value: 50, message: '확인할 비밀번호는 최대 50자 까지입니다' },
                validate: v => v === password || '비밀번호가 일치하지 않습니다!',
              }}
              data-cy="secondPassword"
            />
            <Button id="register-submit" color="primary" type="submit" data-cy="submit">
              등록
            </Button>
          </ValidatedForm>
          <p>&nbsp;</p>
          <Alert color="warning">
            <span></span>
            <a className="alert-link">인증</a>
            <span>
              을 원하시면, 기본 계정을 사용할 수 있습니다:
              <br />- 관리자 (아이디=&quot;admin&quot;, 비밀번호=&quot;admin&quot;) <br />- 사용자 (아이디=&quot;user&quot;,
              비밀번호=&quot;user&quot;).
            </span>
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;
