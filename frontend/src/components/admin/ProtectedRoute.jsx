import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

const ProtectedRoute = ({ children }) => {
  const { t } = useTranslation(); 
  const userFromRedux = useSelector((state) => state.auth.user);
  const user = userFromRedux || JSON.parse(localStorage.getItem("user"));

  console.log("Quyền truy cập hiện tại:", user?.role); 

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    // bọc đa ngôn ngữ cho khối thông báo quyền hạn tại đây
    alert(t('admin.adminDashboard.alerts.accessDenied'));
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;