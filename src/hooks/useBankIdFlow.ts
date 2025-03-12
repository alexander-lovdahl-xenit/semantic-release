import { useEffect, useMemo, useState } from "react";
import { useBankId } from "../providers/BankIdProvider";
import { getBankIdUrl, isIOS } from "../utils";
import { useFinishAuth } from "./useFinishAuth";
import { useQR } from "./useQR";
import { useStartAuth } from "./useStartAuth";
import { useStatus } from "./useStatus";

export type BankIDFlowMode =
  | "not_started"
  | "starting"
  | "working"
  | "done"
  | "failed";

export type BankIdFlowConfig = {
  enabled?: boolean;
};

export const useBankIdFlow = (config: BankIdFlowConfig = {}) => {
  const { apiUrl, loginChallenge, loginHint, loginMethod, ready } =
    useBankId()!;
  const autoStart = useMemo(
    () => ["open_this_device", "mobile"].includes(loginMethod),
    [loginMethod]
  );
  const isQR = useMemo(() => loginMethod === "mobile", [loginMethod]);

  const [mode, setMode] = useState<BankIDFlowMode>("not_started");
  const [enabled, setEnabled] = useState(config.enabled || autoStart);

  const { data: status } = useStatus(
    apiUrl,
    loginChallenge,
    loginMethod,
    enabled
  );
  const runQR = useMemo(() => isQR && mode == "working", [mode]);
  const { data: qrData } = useQR(apiUrl, loginChallenge, runQR);

  const {
    data: startAuth,
    refetch: getStartAuth,
    isLoading: startAuthLoading,
  } = useStartAuth(apiUrl, loginChallenge, loginMethod, false);
  const { data: finish, refetch: getFinishAuth } = useFinishAuth(
    apiUrl,
    loginChallenge
  );

  const { hasRedirect, currentLocation } = useMemo(() => {
    return {
      hasRedirect: false, //isIOS(window.navigator.userAgent),
      currentLocation: window.location.href,
    };
  }, []);

  const [bankIdUrl, setBankIdUrl] = useState<string>();

  useEffect(() => {
    if (!startAuth) return;
    // open app
    const { autoStartToken } = startAuth;
    const redirectUrl = hasRedirect
      ? encodeURIComponent(currentLocation)
      : null;
    setBankIdUrl(getBankIdUrl(autoStartToken, redirectUrl));
  }, [startAuth]);

  useEffect(() => {
    if (!bankIdUrl) return;
    if (isQR) return;
    window.location.assign(bankIdUrl);
  }, [bankIdUrl]);

  useEffect(() => {
    if (!finish) return;
    const { redirect_to } = finish;
    if (redirect_to) {
      window.location.assign(redirect_to);
    }
  }, [finish]);

  useEffect(() => {
    const timeoutId: NodeJS.Timeout[] = [];
    if (!status) return;

    switch (status.status) {
      case "not_started":
        setMode("starting");
        getStartAuth().then(async () => {
          setMode("working");
        });
        break;
      case "complete":
        console.log("COMPLETE");
        setEnabled(false);
        getFinishAuth().then(async () => {
          setMode("done");
        });
        break;
      case "failed":
        console.log("FAILED");
        setMode("failed");
        setEnabled(false);
        break;
      default:
        console.warn("bad status from useStatus", status.status);
        break;
    }
    return () => timeoutId.forEach((id) => clearTimeout(id));
  }, [status?.status]);

  const isBankIdAppOpen = useMemo(() => {
    // if (!startAuthLoading) return true;
    if (!status) return false;
    if (mode == "not_started") return false;
    if (status.hintCode == "outstandingTransaction") return false;
    return true;
  }, [status, startAuthLoading]);

  return {
    mode,
    status,
    isQR,
    autoStart,
    qrData,
    isBankIdAppOpen,
    bankIdUrl,
    startFlow: () => {
      if (!bankIdUrl) {
        setEnabled(true);
        return;
      }
      window.location.assign(bankIdUrl);
    },
  };
};
