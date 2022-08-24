import React, { useEffect } from 'react';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Button, Alert, Col, Row } from 'reactstrap';
import { toast } from 'react-toastify';

import { handlePasswordResetInit, reset } from '../password-reset.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const PasswordResetInit = () => {
  // REQUEST 2. 디스패치 사용
  const dispatch = useAppDispatch();

  // REQUEST 3. 해당 컴포넌트가 렌더링 될 때 password-reset.reducer.ts의 reset 액션 호출 => PasswordResetSlice.actions 호출
  // state 값을 초기 값으로 설정
  // loading: false,
  // resetPasswordSuccess: false,
  // resetPasswordFailure: false,
  // successMessage: null
  useEffect(
    () => () => {
      dispatch(reset());
    },
    []
  );

  // REQUEST 7. 비밀번호 변경을 선택하여 submit 핸들러 실행
  // form의 value 값을 email이라는 파라미터로 함수 실행
  // 함수는 dispatch로 handlePasswordResetInit 액션(password-reset.reducer.ts)을 호출, 파라미터는 email
  const handleValidSubmit = ({ email }) => {
    dispatch(handlePasswordResetInit(email));
  };

  // REQUEST 4. successMessage의 state를 store에서 가져와서 설정
  const successMessage = useAppSelector(state => state.passwordReset.successMessage);

  // REQUEST 5. successMessage의 state 값이 변경될 때 실행
  // successMessage가 true이면, 즉 존재하면 토스트 팝업 success 메소드로 실행
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>비밀번호 변경</h1>
          <Alert color="warning">
            <p>회원가입 시 사용한 이메일 주소를 입력하세요.</p>
          </Alert>
          <ValidatedForm onSubmit={handleValidSubmit}>
            <ValidatedField
              name="email"
              label="이메일"
              placeholder="이메일을 입력하세요"
              type="email"
              validate={{
                required: { value: true, message: '이메일 입력이 필요합니다.' },
                minLength: { value: 5, message: '이메일은 최소 5자 이상이어야 합니다' },
                maxLength: { value: 254, message: '이메일은 최대 50자 까지입니다.' },
                // REQUEST 6. 입력한 v(value) 값을 파라미터로 isEmail메소드(이메일 형식 검사)를 실행하여 true면 value로 인정, false면 오른쪽 문자열 출력
                validate: v => isEmail(v) || '잘못된 이메일입니다.',
              }}
              data-cy="emailResetPassword"
            />
            <Button color="primary" type="submit" data-cy="submit">
              비밀번호 변경
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

export default PasswordResetInit;
