import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getUser, deleteUser } from './user-management.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const UserManagementDeleteDialog = () => {
  // MANAGEMENT-DELETE 3. dispatch와 navigate 사용
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  // MANAGEMENT-DELETE 4. uri에서 login에 해당하는 부분을 사용 (삭제하려는 유저의 로그인 아이디)
  const { login } = useParams<'login'>();

  // MANAGEMENT-DELETE 5. 해당 컴포넌트가 렌더링될 때 실행
  useEffect(() => {
    // MANAGEMENT-DELETE 6. login을 파라미터로 하여 getUser 액션 호출(user-management.reducer.ts), 유저 상태 변경을 위해(선택한 유저로 설정하기 위해)
    dispatch(getUser(login));
  }, []);

  // MANAGEMENT-DELETE 13. 모달 닫는 메소드
  const handleClose = event => {
    // MANAGEMENT-DELETE 14. 이벤트 객체의 버블링(전파) 제거, 여기서 중단
    event.stopPropagation();
    // MANAGEMENT-DELETE 15. 해당 uri로 이동
    navigate('/admin/user-management');
  };

  // MANAGEMENT-DELETE 10. store에서 세팅된 user의 state를 가져와서 user에 할당
  const user = useAppSelector(state => state.userManagement.user);

  // MANAGEMENT-DELETE 16. 삭제 선택 시 컴포넌트 실행
  const confirmDelete = event => {
    // MANAGEMENT-DELETE 17. 유저의 로그인 아이디를 파라미터로 deleteUser 액션 호출(user-management.reducer.ts)
    dispatch(deleteUser(user.login));
    // MANAGEMENT-DELETE 28 END. 모달 닫음
    handleClose(event);
  };

  return (
    // MANAGEMENT-DELETE 11. 모달 오픈 상태에서 toggle 핸들러 handleClose로 지정(모달 밖 선택 시 꺼진다는 의미인 듯)
    <Modal isOpen toggle={handleClose}>
      {/* MANAGEMENT-DELETE 12. 삭제 확인 문구와 닫기 메소드 */}
      <ModalHeader toggle={handleClose}>삭제 확인</ModalHeader>
      <ModalBody>정말로 {user.login} 사용자를 삭제하시겠습니까?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; 취소
        </Button>
        <Button color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; 삭제
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserManagementDeleteDialog;
