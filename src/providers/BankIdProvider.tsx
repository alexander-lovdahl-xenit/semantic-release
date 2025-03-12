import React, {
    createContext,
    FC,
    ReactNode,
    useContext,
    useState,
  } from "react";
  import { getLoginMethodFromLoginHint, isMobile } from "../utils";
  
  export type LoginMethod = ReturnType<typeof getLoginMethodFromLoginHint>;
  
  export type BankIDContextValue = {
    ready: boolean;
    apiUrl: string;
    loginChallenge: string;
    loginHint: string;
    loginMethod: LoginMethod;
    setLoginMethod: (nv: LoginMethod) => void;
  };
  
  const BankIdContext = createContext<BankIDContextValue | null>(null);
  
  export type LoginHint = "mobile" | "this_device" | "open_this_device";
  
  export type BankIdProviderProps = {
    apiUrl: string;
    loginChallenge?: string | null;
    loginHint?: LoginHint | null;
    children: ReactNode;
  };
  
  export const BankIdProvider: FC<BankIdProviderProps> = ({
    children,
    apiUrl,
    loginChallenge,
    loginHint,
  }) => {
    if (!loginChallenge) return <div>login challenge is missing</div>;
    if (loginHint == null || loginHint == undefined)
      return <div>login method is missing</div>;
    const [loginMethod, setLoginMethod] = useState<LoginMethod>(loginHint);
  
    return (
      <BankIdContext.Provider
        value={{
          ready: true,
          apiUrl,
          loginChallenge,
          loginHint,
          loginMethod,
          setLoginMethod,
        }}
      >
        {children}
      </BankIdContext.Provider>
    );
  };
  
  export const useBankId = () => useContext(BankIdContext);
  