import React, { useState, useEffect } from 'react';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { Row, Col, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
import { savePassword, reset } from './password.reducer';

export const PasswordPage = () => {
  // PASSWORD 3. password 상태 변경을 위해
  const [password, setPassword] = useState('');
  // PASSWORD 4. dispatch 사용을 위해 선언
  const dispatch = useAppDispatch();

  // PASSWORD 5. 해당 컴포넌트가 렌더링 될 때 실행
  useEffect(() => {
    // PASSWORD 6. reset 메소드 실행(password.reducer.ts)
    dispatch(reset());
    // PASSWORD 7. (authentication.ts -> AccountResource.java) 현재 로그인 정보를 가져옴(AdminUserDTO 타입)
    dispatch(getSession());
    // PASSWORD 8. reset 메소드 실행(password.reducer.ts)
    return () => {
      dispatch(reset());
    };
  }, []);

  // PASSWORD 9. form submit 메소드 정의
  // PASSWORD 15. currentPassword, newPassword를 파라미터로 주고 savePassword 액션 호출(password.reducer.ts)
  const handleValidSubmit = ({ currentPassword, newPassword }) => {
    dispatch(savePassword({ currentPassword, newPassword }));
  };

  // PASSWORD 10. 패스워드 상태 변경 (비밀번호 일치 확인을 위해 target에서 가져옴)
  const updatePassword = event => setPassword(event.target.value);

  // PASSWORD 11. store에서 계정 정보, 성공 메세지, 에러 메세지를 가져와서 state 설정 
  const account = useAppSelector(state => state.authentication.account);
  const successMessage = useAppSelector(state => state.password.successMessage);
  const errorMessage = useAppSelector(state => state.password.errorMessage);

  // PASSWORD 12. 성공 메세지와 에러 메세지의 값이 변경되면 토스트 팝업으로 출력(에러 메세지도 마찬가지) 후 reset() 호출
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
          {/* PASSWORD 13. submit 메소드 지정 */}
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
            {/* PASSWORD 14. PasswordStrengthBar 컴포넌트에 비밀번호 상태 값을 넘겨주고 호출(password-strength-bar) */}
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
