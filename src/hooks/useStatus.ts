import { Query, useQuery } from "@tanstack/react-query";

export type StatusRequestBody = {
  login_challenge: string;
  login_method: string;
};

export type StatusType = "not_started" | "pending" | "failed" | "complete";

export type StatusResponse = {
  status: StatusType;
  hintCode: string;
};

const callStatus = (baseUrl: string, body: StatusRequestBody) => {
  return fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(body),
  }).then<StatusResponse>((d) => d.json());
};

export const useStatus = (
  backendUrl: string,
  loginChallenge: string,
  loginMethod: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["useStatus"],
    enabled,
    queryFn: () =>
      callStatus(`${backendUrl}/api/se-bankid/status`, {
        login_challenge: loginChallenge,
        login_method: loginMethod,
      }),
    refetchInterval: (data: StatusResponse | undefined) => {
      if (!data) return 1000;
      if (["failed", "complete"].includes(data.status)) return false;
      return 1000;
    },
  });
};
