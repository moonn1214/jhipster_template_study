import React, { useState, useEffect } from 'react';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { Row, Col, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { savePassword, reset } from './password.reducer';

export const PasswordPage = () => {
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(reset());
    dispatch(getSession());
    return () => {
      dispatch(reset());
    };
  }, []);

  const handleValidSubmit = ({ currentPassword, newPassword }) => {
    dispatch(savePassword({ currentPassword, newPassword }));
  };

  const updatePassword = event => setPassword(event.target.value);

  const account = useAppSelector(state => state.authentication.account);
  const successMessage = useAppSelector(state => state.password.successMessage);
  const errorMessage = useAppSelector(state => state.password.errorMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    } else if (errorMessage) {
      toast.error(errorMessage);
    }
    dispatch(reset());
  }, [successMessage, errorMessage]);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="password-title">
            [<strong>{account.login}</strong>] 비밀번호
          </h2>
          <ValidatedForm id="password-form" onSubmit={handleValidSubmit}>
            <ValidatedField
              name="currentPassword"
              label="Current password"
              placeholder="Current password"
              type="password"
              validate={{
                required: { value: true, message: '비밀번호 입력이 필요합니다.' },
              }}
              data-cy="currentPassword"
            />
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
              data-cy="newPassword"
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
              data-cy="confirmPassword"
            />
            <Button color="success" type="submit" data-cy="submit">
              저장
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

export default PasswordPage;
