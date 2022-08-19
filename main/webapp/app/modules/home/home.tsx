import './home.scss';

import React from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Alert } from 'reactstrap';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <Row>
      <Col md="3" className="pad">
        <span className="hipster rounded" />
      </Col>
      <Col md="9">
        <h2>Java Hipster 에 오신 것을 환영합니다!</h2>
        <p className="lead">이것은 당신의 홈페이지입니다.</p>
        {account?.login ? (
          <div>
            <Alert color="success">&quot;{account.login}&quot;(으)로 로그인하셨습니다.</Alert>
          </div>
        ) : (
          <div>
            <Alert color="warning">
              <span>&nbsp;</span>
              <Link to="/login" className="alert-link">
                인증
              </Link>
              을 원하시면, 기본 계정을 사용할 수 있습니다:
              <br />- 관리자 (아이디=&quot;admin&quot;, 비밀번호=&quot;admin&quot;) <br />- 사용자 (아이디=&quot;user&quot;,
              비밀번호=&quot;user&quot;).
            </Alert>

            <Alert color="warning">
              아직 계정이 없습니까?&nbsp;
              <Link to="/account/register" className="alert-link">
                새로운 계정을 등록하세요
              </Link>
            </Alert>
          </div>
        )}
        <p>JHipster에 질문이 있다면:</p>

        <ul>
          <li>
            <a href="https://www.jhipster.tech/" target="_blank" rel="noopener noreferrer">
              JHipster 홈페이지
            </a>
          </li>
          <li>
            <a href="https://stackoverflow.com/tags/jhipster/info" target="_blank" rel="noopener noreferrer">
              JHipster Stack Overflow
            </a>
          </li>
          <li>
            <a href="https://github.com/jhipster/generator-jhipster/issues?state=open" target="_blank" rel="noopener noreferrer">
              JHipster 버그 트랙커
            </a>
          </li>
          <li>
            <a href="https://gitter.im/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">
              JHipster public chat room
            </a>
          </li>
          <li>
            <a href="https://twitter.com/jhipster" target="_blank" rel="noopener noreferrer">
              트위터에서 @jhipster 에 접속하세요.
            </a>
          </li>
        </ul>

        <p>
          JHipster 가 마음에 든다면, 별을 주는 것을 잊지 마세요.{' '}
          <a href="https://github.com/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          !
        </p>
      </Col>
    </Row>
  );
};

export default Home;
