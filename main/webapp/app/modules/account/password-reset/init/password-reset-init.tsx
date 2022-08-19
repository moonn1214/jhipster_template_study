import React, { useEffect } from 'react';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Button, Alert, Col, Row } from 'reactstrap';
import { toast } from 'react-toastify';

import { handlePasswordResetInit, reset } from '../password-reset.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const PasswordResetInit = () => {
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      dispatch(reset());
    },
    []
  );

  const handleValidSubmit = ({ email }) => {
    dispatch(handlePasswordResetInit(email));
  };

  const successMessage = useAppSelector(state => state.passwordReset.successMessage);

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
