import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { login } from 'app/shared/reducers/authentication';
import LoginModal from './login-modal';

export const Login = () => {
  // dispatch를 보내는 메소드 (메소드를 호출한다.)
  const dispatch = useAppDispatch();
  // store를 가져와서 state 값을 변경
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const loginError = useAppSelector(state => state.authentication.loginError);
  const showModalLogin = useAppSelector(state => state.authentication.showModalLogin);
  // state 상태 관리, 로그인 모달 상태
  const [showModal, setShowModal] = useState(showModalLogin);
  const navigate = useNavigate();
  const location = useLocation();

  // 해당 컴포넌트가 렌더링 될 때 setShowModal(true) 실행, 모달 표시
  useEffect(() => {
    setShowModal(true);
  }, []);

  // 로그인 함수, 아이디 패스워드 자동로그인 값을 dispatch로 보냄(authentication.ts -> login 메소드의 파라미터로 담아서 메소드를 호출)
  const handleLogin = (username, password, rememberMe = false) => dispatch(login(username, password, rememberMe));

  // 로그인 취소 함수, 모달을 닫고 루트 페이지(home.tsx)로 이동(routes.tsx를 통해 index를 home.tsx로 설정함)
  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  // 현재 url 또는 루트 페이지
  const { from } = (location.state as any) || { from: { pathname: '/', search: location.search } };
  // 유저가 로그인 상태면 루트 페이지로 돌아감
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  // 로그인 상태가 아니면 모달을 표시(LoginModal(login-modal.tsx) 컴포넌트 반환)하고 로그인 함수, 로그인 취소 함수, 로그인 에러 상태를 넘겨줌
  return <LoginModal showModal={showModal} handleLogin={handleLogin} handleClose={handleClose} loginError={loginError} />;
};

export default Login;
