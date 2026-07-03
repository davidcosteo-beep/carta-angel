import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const getStatus = () =>
    typeof navigator === "undefined" ? true : navigator.onLine;

  const [isOnline, setIsOnline] = useState(getStatus);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(getStatus());
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
