import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import UserManagement from './user-management';
import UserManagementDetail from './user-management-detail';
import UserManagementUpdate from './user-management-update';
import UserManagementDeleteDialog from './user-management-delete-dialog';

const UserManagementRoutes = () => (
  <ErrorBoundaryRoutes>
    {/* MANAGEMENT 5. index는 UserManagement 컴포넌트로 지정(user-management.tsx) */}
    <Route index element={<UserManagement />} />
    {/* MANAGEMENT-UPDATE 2. new 경로는 UserManagementUpdate 컴포넌트 사용(user-management-update.tsx) */}
    <Route path="new" element={<UserManagementUpdate />} />
    {/* MANAGEMENT-DETAIL 2. user의 login(아이디) 경로는 UserManagementDetail 컴포넌트 사용(user-management-detail.tsx) */}
    <Route path=":login">
      <Route index element={<UserManagementDetail />} />
      <Route path="edit" element={<UserManagementUpdate />} />
      <Route path="delete" element={<UserManagementDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default UserManagementRoutes;
