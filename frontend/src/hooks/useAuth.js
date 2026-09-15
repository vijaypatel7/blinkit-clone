import { useDispatch, useSelector } from 'react-redux';
import { setSession, clearSession } from '../store/authSlice.js';

/**
 * Auth hook — reads session state and exposes login/logout actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    login: (payload) => dispatch(setSession(payload)),
    logout: () => dispatch(clearSession()),
  };
}
