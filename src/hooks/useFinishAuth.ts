import { useQuery } from "@tanstack/react-query";

export type FinishAuthRequestBody = {
  login_challenge: string;
}

export type FinishAuthResponse = {
  redirect_to?: string
}

const callFinishAuth = (baseUrl: string, body: FinishAuthRequestBody) => {
  return fetch(baseUrl, {
    method: "POST",
  }).then<FinishAuthResponse>((d) => d.json());
};

export const useFinishAuth = (
  backendUrl: string,
  loginChallenge: string,
) => {
  return useQuery({
    queryKey: ["useFinishAuth"],
    enabled: false,
    queryFn: () =>
      callFinishAuth(`${backendUrl}api/finish?login_challenge=${loginChallenge}`, {
        login_challenge: loginChallenge,
      }),
  });
};
