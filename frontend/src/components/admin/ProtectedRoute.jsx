import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loader from '../common/Loader';

// Gates every /admin/* page except /admin/login. Redirects to the
// (unlinked, "hidden URL") login page when there's no valid session.
export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return <Loader label="Шалгаж байна..." />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
