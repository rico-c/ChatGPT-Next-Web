import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

export const useUserInfo = () => {
  const { isLoaded, isSignedIn } = useAuth();
  // const { user } = useUser();
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const f = async () => {
        const res = await axios.get("/api/user");
        console.log(res);
        setUserInfo(res.data);
      };
      f();
    }
  }, [isLoaded, isSignedIn]);

  return { userInfo };
};
