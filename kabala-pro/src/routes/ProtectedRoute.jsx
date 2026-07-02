import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';

export default function ProtectedRoute({ children }) {

  if (!isTokenValid()) {

    return <Navigate to="/login" replace />;

  }

  return children;

}
