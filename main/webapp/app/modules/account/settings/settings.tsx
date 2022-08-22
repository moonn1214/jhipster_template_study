import React, { useEffect } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import { saveAccountSettings, reset } from './settings.reducer';

export const SettingsPage = () => {
  // SETTINGS 3. dispatch 사용을 위해 선언
  const dispatch = useAppDispatch();
  // SETTINGS 4. store에서 계정 정보 가져옴, state 변경
  const account = useAppSelector(state => state.authentication.account);
  // SETTINGS 5. store에서 settings 성공 메세지 가져옴, state 변경
  const successMessage = useAppSelector(state => state.settings.successMessage);

  // SETTINGS 6. 해당 컴포넌트가 렌더링 될 때 authentication.ts의 getSession 메소드 호출
  useEffect(() => {
    // SETTINGS 7. (authentication.ts -> AccountResource.java) 현재 로그인 정보를 가져옴(AdminUserDTO 타입)
    dispatch(getSession());
    // SETTINGS 8. settings.reducer.ts의 reset 메소드 호출
    return () => {
      // SETTINGS 9. 초기 state 값으로 세팅 (successMessage : null)
      dispatch(reset());
    };
  }, []);

  // SETTINGS 10. 성공 메세지의 값이 변경되면 토스트 팝업으로 출력
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  // SETTINGS 14. submit 메소드 실행(계정 정보와 form의 values를 파라미터로 하여 settings.reducer.ts의 saveAccountSettings 메소드 호출)
  const handleValidSubmit = values => {
    dispatch(
      saveAccountSettings({
        ...account,
        ...values,
      })
    );
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="settings-title">
            {/* SETTINGS 11. state 계정 정보의 아이디 값을 받아서 사용 */}
            [<strong>{account.login}</strong>] 사용자 설정
          </h2>
          {/* SETTINGS 12. submit 메소드 지정, 기본 값들은 account로 받아서 설정되어 있음 */}
          <ValidatedForm id="settings-form" onSubmit={handleValidSubmit} defaultValues={account}>
            <ValidatedField
              name="firstName"
              label="이름"
              id="firstName"
              placeholder="이름"
              validate={{
                required: { value: true, message: '이름을 입력해 주세요.' },
                minLength: { value: 1, message: '이름은 최소 1자 이상이어야 합니다' },
                maxLength: { value: 50, message: '이름은 최대 50자 까지입니다' },
              }}
              data-cy="firstname"
            />
            <ValidatedField
              name="lastName"
              label="성"
              id="lastName"
              placeholder="성"
              validate={{
                required: { value: true, message: '성을 입력해 주세요.' },
                minLength: { value: 1, message: '성은 최소 1자 이상이어야 합니다' },
                maxLength: { value: 50, message: '성은 최대 50자 까지입니다' },
              }}
              data-cy="lastname"
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
                // SETTINGS 13. 이메일 형식이 맞는지 유효성 검사, false이면 오른쪽 출력
                validate: v => isEmail(v) || '잘못된 이메일입니다.',
              }}
              data-cy="email"
            />
            <Button color="primary" type="submit" data-cy="submit">
              저장
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
