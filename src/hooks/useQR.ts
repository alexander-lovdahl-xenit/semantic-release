import { useQuery } from "@tanstack/react-query";

export type QRRequestBody = {
  login_challenge: string;
};

export type QRType = "not_started" | "pending" | "failed" | "complete";

export type QRResponse = {
  qrCode: QRType;
  hintCode: string;
};

const callQR = (baseUrl: string, body: QRRequestBody) => {
  return fetch(baseUrl, {
    method: "GET",
  }).then<QRResponse>((d) => d.json());
};

export const useQR = (
  backendUrl: string,
  loginChallenge: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["useQR"],
    enabled,
    queryFn: () =>
      callQR(`${backendUrl}/api/se-bankid/qrcode?login_challenge=${loginChallenge}`, {
        login_challenge: loginChallenge,
      }),
    refetchInterval: (data: QRResponse | undefined) => {
      return 1000;
    },
  });
};
