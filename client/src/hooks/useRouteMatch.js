import { useLocation, matchPath } from "react-router-dom";
// this custom hook check if current location is same as path or not;
export default function useRouteMatch(path) {
  const location = useLocation();
  return matchPath(location.pathname, { path });
}

