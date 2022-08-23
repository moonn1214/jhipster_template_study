import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Badge } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';

import { getUser } from './user-management.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const UserManagementDetail = () => {
  // MANAGEMENT-DETAIL 3. 디스패치(액션 호출과 상태 관리) 사용을 위해
  const dispatch = useAppDispatch();

  // MANAGEMENT-DETAIL 4. url에서 name이 login인 파라미터의 값을 사용(현재 상세정보 페이지의 유저 로그인 아이디)
  const { login } = useParams<'login'>();

  // MANAGEMENT-DETAIL 5. 해당 컴포넌트가 렌더링될 때 실행
  // login을 파라미터로 getUser 액션 호출 (user-management.reducer.ts)
  useEffect(() => {
    dispatch(getUser(login));
  }, []);

  // MANAGEMENT-DETAIL 13. store에서 유저 정보 상태를 가져옴
  const user = useAppSelector(state => state.userManagement.user);

  return (
    // MANAGEMENT-DETAIL 14 END. user의 정보를 토대로 양식 작성
    <div>
      <h2>
        사용자 [<strong>{user.login}</strong>]
      </h2>
      <Row size="md">
        <dl className="jh-entity-details">
          <dt>로그인 아이디</dt>
          <dd>
            <span>{user.login}</span>&nbsp;
            {user.activated ? <Badge color="success">활성</Badge> : <Badge color="danger">비활성</Badge>}
          </dd>
          <dt>이름</dt>
          <dd>{user.firstName}</dd>
          <dt>성</dt>
          <dd>{user.lastName}</dd>
          <dt>이메일</dt>
          <dd>{user.email}</dd>
          <dt>생성자</dt>
          <dd>{user.createdBy}</dd>
          <dt>생성일</dt>
          <dd>{user.createdDate ? <TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /> : null}</dd>
          <dt>수정자</dt>
          <dd>{user.lastModifiedBy}</dd>
          <dt>수정일</dt>
          <dd>
            {user.lastModifiedDate ? (
              <TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />
            ) : null}
          </dd>
          <dt>Profiles</dt>
          <dd>
            <ul className="list-unstyled">
              {user.authorities
                ? user.authorities.map((authority, i) => (
                    <li key={`user-auth-${i}`}>
                      <Badge color="info">{authority}</Badge>
                    </li>
                  ))
                : null}
            </ul>
          </dd>
        </dl>
      </Row>
      <Button tag={Link} to="/admin/user-management" replace color="info">
        <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">뒤로</span>
      </Button>
    </div>
  );
};

export default UserManagementDetail;
