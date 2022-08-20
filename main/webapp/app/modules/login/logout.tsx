import React, { useLayoutEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { logout } from 'app/shared/reducers/authentication';

export const Logout = () => {
  // LOGOUT 3. store를 가져와서 state 값을 읽어옴
  const logoutUrl = useAppSelector(state => state.authentication.logoutUrl);
  const dispatch = useAppDispatch();

  // LOGOUT 4. useEffect => DOM이 화면에 그려진 후에 호출
  //           useLayoutEffect => DOM이 화면에 그려지기 전에 호출
  useLayoutEffect(() => {
    // LOGOUT 5. athentication.ts의 logout 메소드를 호출
    dispatch(logout());
    // LOGOUT 11. logoutUrl이 있으면 이동
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
  });

  // LOGOUT 12 END. html 리턴
  return (
    <div className="p-5">
      <h4>Logged out successfully!</h4>
    </div>
  );
};

export default Logout;
