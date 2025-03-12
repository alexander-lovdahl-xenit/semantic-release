import { useQuery } from "@tanstack/react-query";

export interface StartAuthRequestBody {
  login_challenge: string;
  login_method: string;
}

export interface StartAuthResponse {
  autoStartToken: string;
}

const callStartAuth = (baseUrl: string, body: StartAuthRequestBody) => {
  return fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(body),
  }).then<StartAuthResponse>((d) => d.json());
};

export const useStartAuth = (
  backendUrl: string,
  loginChallenge: string,
  loginMethod: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["useStartAuth"],
    enabled,
    queryFn: () =>
      callStartAuth(`${backendUrl}/api/se-bankid/start-auth`, {
        login_challenge: loginChallenge,
        login_method: loginMethod,
      }),
  });
};
