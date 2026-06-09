import { Navigate } from "react-router-dom";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AuthPage() {
  return <Navigate to={`${basePath}/sign-in`} replace />;
}
