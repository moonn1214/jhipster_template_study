import React from 'react';
import { ValidatedField } from 'react-jhipster';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Row, Col, Form } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

// Login(login.tsx) 컴포넌트로부터 LoginModal이 넘겨 받은 값(props) 설정에 대한 인터페이스
export interface ILoginModalProps {
  showModal: boolean;
  loginError: boolean;
  handleLogin: (username: string, password: string, rememberMe: boolean) => void;
  handleClose: () => void;
}

const LoginModal = (props: ILoginModalProps) => {
  // Login에서 받은 값으로 로그인 함수 정의
  const login = ({ username, password, rememberMe }) => {
    props.handleLogin(username, password, rememberMe);
  };

  // useForm hook 사용
  const {
    /**
     * handleSubmit은 e.preventDefault()를 가지고 있음
     * register는 input 값 관리에 용이하고 Validation check를 해줌
     * onTouched 실행 때 실행됨
     */
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm({ mode: 'onTouched' });

  // 로그인 에러 상태와 로그인 취소 함수를 props로 초기화
  const { loginError, handleClose } = props;

  // submit 할 때 로그인 함수 실행
  const handleLoginSubmit = e => {
    handleSubmit(login)(e);
  };

  return (
    <Modal isOpen={props.showModal} toggle={handleClose} backdrop="static" id="login-page" autoFocus={false}>
      {/* submit 함수 설정 */}
      <Form onSubmit={handleLoginSubmit}>
        <ModalHeader id="login-title" data-cy="loginTitle" toggle={handleClose}>
          인증
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12">
              {/* 로그인 에러 상태에 따라 표시 */}
              {loginError ? (
                <Alert color="danger" data-cy="loginError">
                  <strong>인증 실패!</strong> credential을 확인하고 다시 시도해 주세요.
                </Alert>
              ) : null}
            </Col>
            <Col md="12">
              <ValidatedField
                name="username"
                label="로그인 아이디"
                placeholder="로그인 아이디"
                required
                autoFocus
                data-cy="username"
                validate={{ required: 'Username cannot be empty!' }}
                register={register}
                error={errors.username}
                isTouched={touchedFields.username}
              />
              <ValidatedField
                name="password"
                type="password"
                label="비밀번호"
                placeholder="당신의 비밀번호"
                required
                data-cy="password"
                validate={{ required: 'Password cannot be empty!' }}
                register={register}
                error={errors.password}
                isTouched={touchedFields.password}
              />
              <ValidatedField name="rememberMe" type="checkbox" check label="자동 로그인" value={true} register={register} />
            </Col>
          </Row>
          <div className="mt-1">&nbsp;</div>
          <Alert color="warning">
            <Link to="/account/reset/request" data-cy="forgetYourPasswordSelector">
              비밀번호를 잊으셨나요?
            </Link>
          </Alert>
          <Alert color="warning">
            <span>아직 계정이 없습니까?</span> <Link to="/account/register">새로운 계정을 등록하세요</Link>
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleClose} tabIndex={1}>
            취소
          </Button>{' '}
          <Button color="primary" type="submit" data-cy="submit">
            인증하기
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default LoginModal;
