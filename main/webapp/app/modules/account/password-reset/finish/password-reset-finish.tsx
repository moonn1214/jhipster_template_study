import React, { useState, useEffect } from 'react';
import { Col, Row, Button } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { handlePasswordResetFinish, reset } from '../password-reset.reducer';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const PasswordResetFinishPage = () => {
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');

  const [password, setPassword] = useState('');

  useEffect(
    () => () => {
      dispatch(reset());
    },
    []
  );

  const handleValidSubmit = ({ newPassword }) => dispatch(handlePasswordResetFinish({ key, newPassword }));

  const updatePassword = event => setPassword(event.target.value);

  const getResetForm = () => {
    return (
      <ValidatedForm onSubmit={handleValidSubmit}>
        <ValidatedField
          name="newPassword"
          label="새 비밀번호"
          placeholder="새 비밀번호"
          type="password"
          validate={{
            required: { value: true, message: '비밀번호 입력이 필요합니다.' },
            minLength: { value: 4, message: '비밀번호는 최소 4자 이상이어야 합니다' },
            maxLength: { value: 50, message: '비밀번호는 최대 50자 까지입니다.' },
          }}
          onChange={updatePassword}
          data-cy="resetPassword"
        />
        <PasswordStrengthBar password={password} />
        <ValidatedField
          name="confirmPassword"
          label="새 비밀번호 확인"
          placeholder="새 비밀번호 확인"
          type="password"
          validate={{
            required: { value: true, message: '확인할 비밀번호 입력이 필요합니다.' },
            minLength: { value: 4, message: '확인할 비밀번호는 최소 4자 이상이어야 합니다' },
            maxLength: { value: 50, message: '확인할 비밀번호는 최대 50자 까지입니다' },
            validate: v => v === password || '비밀번호가 일치하지 않습니다!',
          }}
          data-cy="confirmResetPassword"
        />
        <Button color="success" type="submit" data-cy="submit">
          새 비밀번호 검증
        </Button>
      </ValidatedForm>
    );
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
        <Col md="4">
          <h1>비밀번호 변경</h1>
          <div>{key ? getResetForm() : null}</div>
        </Col>
      </Row>
    </div>
  );
};

export default PasswordResetFinishPage;
