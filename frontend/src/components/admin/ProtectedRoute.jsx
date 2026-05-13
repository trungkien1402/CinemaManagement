import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userFromRedux = useSelector((state) => state.auth.user);
  const user = userFromRedux || JSON.parse(localStorage.getItem("user"));

  console.log("Quyền truy cập hiện tại:", user?.role); 

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    alert("Bạn không có quyền vào khu vực Admin!");
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;