import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Ưu tiên lấy từ Redux, nếu không có thì kiểm tra localStorage
  const userFromRedux = useSelector((state) => state.auth.user);
  const user = userFromRedux || JSON.parse(localStorage.getItem("user"));

  console.log("Quyền truy cập hiện tại:", user?.role); // Kiểm tra log để debug

  if (!user) {
    // Nếu chưa đăng nhập, đá về trang chủ để mở Modal Login
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    // Nếu là user thường, cảnh báo và đá về Home
    alert("Bạn không có quyền vào khu vực Admin!");
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;