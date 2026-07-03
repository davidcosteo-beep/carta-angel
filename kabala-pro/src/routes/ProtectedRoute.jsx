import { Navigate } from 'react-router-dom';
import {
  getUserRole,
  isTokenValid
} from '../utils/auth';
import {
  canAccessRole,
  getSafeRouteForRole
} from '../utils/permissions';

export default function ProtectedRoute({
  allowedRoles,
  children
}) {

  if (!isTokenValid()) {

    return <Navigate to="/login" replace />;

  }

  const userRole = getUserRole();

  if (!canAccessRole(userRole, allowedRoles)) {

    return (
      <Navigate
        to={getSafeRouteForRole(userRole)}
        replace
      />
    );

  }

  return children;

}
