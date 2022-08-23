import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table, Badge } from 'reactstrap';
import { TextFormat, JhiPagination, JhiItemCount, getSortState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { getUsersAsAdmin, updateUser } from './user-management.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const UserManagement = () => {
  // MANAGEMENT 6. dispatch를 사용하기 위해
  const dispatch = useAppDispatch();

  // MANAGEMENT 7. useLocation : 현재 페이지에 대한 정보를 알려주는 hooks
  const location = useLocation();
  // MANAGEMENT 8. useNavigate : 양식이 제출되거나 특정 event가 발생할 때 url을 조작하는 hooks
  const navigate = useNavigate();

  // MANAGEMENT 9. 페이지 상태 관리
  // useState => pagination 상태 관리되는 값, setPagination 상태 관리 메소드, useState의 파라미터는 기본값 설정
  const [pagination, setPagination] = useState(
    // MANAGEMENT 10. 현재 페이지 정보, 페이지당 항목 수(20), id라는 이름으로 가져온 IPaginationBaseState와 pathname의 ? 다음의 문자열(쿼리 문자열)
    // 두 가지를 파라미터로 아래 메소드 실행(entity-utils.ts의 메소드)
    // 두 가지 정보로 현재 페이지 설정
    overridePaginationStateWithQueryParams(getSortState(location, ITEMS_PER_PAGE, 'id'), location.search)
  );

  // MANAGEMENT 12. user-management.reducer.ts의 getUsersAsAdmin 액션 호출
  // 현재페이지-1, 페이지당 항목 수, 정렬 기준과 방식을 파라미터로 입력
  const getUsersFromProps = () => {
    dispatch(
      getUsersAsAdmin({
        page: pagination.activePage - 1,
        size: pagination.itemsPerPage,
        sort: `${pagination.sort},${pagination.order}`,
      })
    );
    // MANAGEMENT 24. endURL 설정, 현재 값 사용
    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    // MANAGEMENT 25. pathname의 쿼리 문자열이 endURL과 다르다면
    if (location.search !== endURL) {
      // MANAGEMENT 26. endURL로 이동
      navigate(`${location.pathname}${endURL}`);
    }
  };

  // MANAGEMENT 11. activePage, order, sort가 변경될 때 getUsersFromProps 실행
  useEffect(() => {
    getUsersFromProps();
  }, [pagination.activePage, pagination.order, pagination.sort]);

  // MANAGEMENT 27. location.search가 변경될 때 실행
  useEffect(() => {
    // MANAGEMENT 28. URLSearchParams => url에서 쿼리 파라미터를 가져오거나 수정할 때 사용
    // location.search(쿼리 파라미터)로 URLSeachParams 생성
    const params = new URLSearchParams(location.search);
    // MANAGEMENT 29. 쿼리 파라미터에서 page와 sort 가져옴
    const page = params.get('page');
    const sortParam = params.get(SORT);
    // MANAGEMENT 30. 둘 다 존재하면
    if (page && sortParam) {
      // sort 문자열을 나눔
      const sortSplit = sortParam.split(',');
      // 페이지 상태를 변경함
      setPagination({
        ...pagination,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [location.search]);

  const sort = p => () =>
    setPagination({
      ...pagination,
      order: pagination.order === ASC ? DESC : ASC,
      sort: p,
    });

  // MANAGEMENT 52. 쪽수 번호 선택 시 실행
  // currentPage로 pagination와 currentPage의 상태를 변경함
  const handlePagination = currentPage =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    getUsersFromProps();
  };

  // MANAGEMENT 36. 활성/비활성 상태 변경 메소드, user-management.reducer.tsx의 updateUser 액션 호출(user 정보를 파라미터)
  // 활성 상태를 반대로 변경
  // function toggleActive (user) { ... }
  const toggleActive = user => () => {
    dispatch(
      updateUser({
        ...user,
        activated: !user.activated,
      })
    );
  };

  // MANAGEMENT 31. store에서 계정 정보, 유저, 모든 항목 수, 로딩을 가져옴
  const account = useAppSelector(state => state.authentication.account);
  const users = useAppSelector(state => state.userManagement.users);
  const totalItems = useAppSelector(state => state.userManagement.totalItems);
  const loading = useAppSelector(state => state.userManagement.loading);

  return (
    <div>
      <h2 id="user-management-page-heading" data-cy="userManagementPageHeading">
        사용자
        <div className="d-flex justify-content-end">
          {/* MANAGEMENT 32. 새로고침 시 handleSyncList 메소드 실행(getUsersFromProps 메소드임) */}
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh list
          </Button>
          {/* MANAGEMENT 33. MANAGEMENT-UPDATE 1. 생성을 선택하면 /new 링크로 이동 (user-management/index.tsx에서 지정) */}
          <Link to="new" className="btn btn-primary jh-create-entity">
            <FontAwesomeIcon icon="plus" /> 사용자 생성
          </Link>
        </div>
      </h2>
      <Table responsive striped>
        {/* MANAGEMENT 34. 테이블 속성 생성, onClick 메소드는 각 속성으로 정렬 */}
        <thead>
          <tr>
            <th className="hand" onClick={sort('id')}>
              ID
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('login')}>
              로그인 아이디
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('email')}>
              이메일
              <FontAwesomeIcon icon="sort" />
            </th>
            <th />
            <th>Profiles</th>
            <th className="hand" onClick={sort('createdDate')}>
              생성일
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('lastModifiedBy')}>
              수정자
              <FontAwesomeIcon icon="sort" />
            </th>
            <th id="modified-date-sort" className="hand" onClick={sort('lastModifiedDate')}>
              수정일
              <FontAwesomeIcon icon="sort" />
            </th>
            <th />
          </tr>
        </thead>
        {/* MANAGEMENT 35. 테이블 바디 생성 */}
        <tbody>
          {/* user 정보와 i 변수(몇번째유저) */}
          {users.map((user, i) => (
            // id 는 유저의 아이디
            <tr id={user.login} key={`user-${i}`}>
              <td>
                {/* MANAGEMENT-DETAIL 1. user.id(number) 클릭 시 유저의 아이디 링크로 이동(user-management/index.tsx에서 지정) */}
                <Button tag={Link} to={user.login} color="link" size="sm">
                  {user.id}
                </Button>
              </td>
              {/* 유저 아이디 */}
              <td>{user.login}</td>
              {/* 유저 이메일 */}
              <td>{user.email}</td>
              {/* 유저가 활성화 상태면 활성, 비활성화 상태면 비활성화, onClick 메소드는 toggleActive, 파라미터로 user */}
              <td>
                {user.activated ? (
                  <Button color="success" onClick={toggleActive(user)}>
                    활성
                  </Button>
                ) : (
                  <Button color="danger" onClick={toggleActive(user)}>
                    비활성
                  </Button>
                )}
              </td>
              {/* 유저의 권한 정보 */}
              <td>
                {user.authorities
                  // 유저의 권한 정보가 존재하면 실행 (권한 정보와 몇번째권한)
                  ? user.authorities.map((authority, j) => (
                      <div key={`user-auth-${i}-${j}`}>
                        <Badge color="info">{authority}</Badge>
                      </div>
                    ))
                  // 유저의 권한 정보가 없으면 null
                  : null}
              </td>
              {/* 유저의 생성일이 존재하면 설정된 포맷으로 생성일을 value로 지정, 존재하지 않으면 null */}
              <td>
                {user.createdDate ? <TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /> : null}
              </td>
              {/* 유저에 대해 수정한 사람 */}
              <td>{user.lastModifiedBy}</td>
              {/* 유저의 마지막 수정일이 존재하면 value, 없으면 null */}
              <td>
                {user.lastModifiedDate ? (
                  <TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />
                ) : null}
              </td>
              {/* MANAGEMENT 49. 상세정보, 수정, 삭제 버튼 */}
              <td className="text-end">
                <div className="btn-group flex-btn-group-container">
                  {/* MANAGEMENT-DETAIL 1. 클릭 시 to 링크로 이동(user-management/index.tsx에서 지정) */}
                  <Button tag={Link} to={user.login} color="info" size="sm">
                    <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">보기</span>
                  </Button>
                  {/* MANAGEMENT-EDIT 1. 클릭 시 to 링크로 이동(user-management/index.tsx에서 지정) */}
                  <Button tag={Link} to={`${user.login}/edit`} color="primary" size="sm">
                    <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">수정</span>
                  </Button>
                  {/* MANAGEMENT-DELETE 1. 클릭 시 to 링크로 이동(user-management/index.tsx에서 지정) */}
                  <Button tag={Link} to={`${user.login}/delete`} color="danger" size="sm" disabled={account.login === user.login}>
                    <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">삭제</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* MANAGEMENT 50. 모든 항목 수 로 값 설정 */}
      {totalItems ? (
        // store에서 가져온 항목이 1개 이상일 때
        <div className={users?.length > 0 ? '' : 'd-none'}>
          <div className="justify-content-center d-flex">
            {/* page = 현재 페이지번호, total = 모든 항목 수, itemsPerPage = 페이지 당 항목수(20) 로 JhiItemCount 컴포넌트 사용 */}
            <JhiItemCount page={pagination.activePage} total={totalItems} itemsPerPage={pagination.itemsPerPage} i18nEnabled />
          </div>
          <div className="justify-content-center d-flex">
            {/* MANAGEMENT 51. activePage = 현재 페이지번호, onSelect = handlePagination메소드, 
            maxButtons = 5, itemsPerPage = 20, totalItems = 모든 항목 수 로 JhiPagination 컴포넌트 사용(아마 아래 쪽수 번호인 듯)*/}
            <JhiPagination
              activePage={pagination.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      ) : (
        // 항목이 0개면 공백
        ''
      )}
    </div>
  );
};

export default UserManagement;
