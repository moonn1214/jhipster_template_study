import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Settings from './settings/settings';
import Password from './password/password';

const AccountRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      {/* SETTINGS 2. /settings 경로는 Settings 컴포넌트 사용 */}
      <Route path="settings" element={<Settings />} />
      {/* PASSWORD 2. /password 경로는 Password 컴포넌트 사용 */}
      <Route path="password" element={<Password />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default AccountRoutes;
