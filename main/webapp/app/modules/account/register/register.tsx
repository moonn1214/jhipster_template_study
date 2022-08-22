import React, { useState, useEffect } from 'react';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Row, Col, Alert, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { handleRegister, reset } from './register.reducer';

export const RegisterPage = () => {
  // REGISTER 2. 패스워드 상태 관리를 위해
  const [password, setPassword] = useState('');
  // REGISTER 3. dispatch 사용을 위해 선언
  const dispatch = useAppDispatch();

  // REGISTER 4. 해당 컴포넌트가 렌더링 될 때 reset 메소드 호출
  useEffect(
    () => () => {
      dispatch(reset());
    },
    []
  );

  // REGISTER 5. 폼 전송 메소드
  // REGISTER 13. handleRegister 호출 (입력 정보를 파라미터로 사용)
  const handleValidSubmit = ({ username, email, firstPassword }) => {
    dispatch(handleRegister({ login: username, email, password: firstPassword, langKey: 'en' }));
  };

  // REGISTER 6. 패스워드 상태 변경
  const updatePassword = event => setPassword(event.target.value);

  // REGISTER 7. 등록 성공 메세지를 store에서 가져옴
  const successMessage = useAppSelector(state => state.register.successMessage);

  // REGISTER 8. 등록 성공 메세지가 있으면 토스트 팝업 표시
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
          {/* REGISTER 9. submit 메소드 설정 */}
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
                // REGISTER 10. 이메일 유효성 검사(존재 여부 확인), false이면 오른쪽
                validate: v => isEmail(v) || '잘못된 이메일입니다.',
              }}
              data-cy="email"
            />
            <ValidatedField
              name="firstPassword"
              label="새 비밀번호"
              placeholder="새 비밀번호"
              type="password"
              // REGISTER 11. 패스워드 상태 변경 (비밀번호 확인을 위해 target에서 가져옴)
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
                // REGISTER 12. 패스워드 일치 여부 검사
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
