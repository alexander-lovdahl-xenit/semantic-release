import { UAParser } from "ua-parser-js";
import { LoginHint } from "../providers/BankIdProvider";

export function getLoginMethodFromLoginHint(
  login_hint: string,
  isMobileBrowser = false
): LoginHint {
  if (["this_device", "open_this_device", "mobile"].includes(login_hint))
    return login_hint as LoginHint;
  return isMobileBrowser ? "this_device" : "mobile";
}

export function isIOS(userAgent: string) {
  return new UAParser(userAgent).getOS().is("ios");
}

export function isAndroid(userAgent: string) {
  return new UAParser(userAgent).getOS().is("android");
}

export function isInApp(userAgent: string) {
  return new UAParser(userAgent).getBrowser().is("inapp");
}

export function isMobile(userAgent: string) {
  return new UAParser(userAgent).getDevice().is("mobile");
}

export function getBankIdUrl(
  autoStartToken: string,
  redirectUrl: string | null = null
) {
  const ua = window.navigator.userAgent;
  if (isInApp(ua)) {
    if (isIOS(ua)) return getBankIdUrlOther(autoStartToken, "null");
    if (isAndroid(ua)) return getBankIdUrlMobile(autoStartToken);
  }

  if (isMobile(ua)) {
    if (isIOS(ua)) return getBankIdUrlMobile(autoStartToken, "null");
    if (isAndroid(ua)) return getBankIdUrlMobile(autoStartToken);
  }

  return getBankIdUrlOther(autoStartToken, redirectUrl);
}

export function getBankIdUrlMobile(
  autoStartToken: string,
  redirectUrl: string | null = null
) {
  return `https://app.bankid.com/?${buildQueryString({
    autostarttoken: autoStartToken,
    redirect: redirectUrl,
  })}`;
}

export function getBankIdUrlOther(
  autoStartToken: string,
  redirectUrl: string | null = null
) {
  return `bankid:///?${buildQueryString({
    autostarttoken: autoStartToken,
    redirect: redirectUrl,
  })}`;
}

function buildQueryString(
  keyValueObject: Record<string, string | null | undefined>
) {
  return Object.entries(keyValueObject)
    .map(([key, value]) => {
      if (!value) return null;
      console.log([key, value]);

      return [key, value].join("=");
    })
    .filter((v) => typeof v === "string")
    .join("&");
}
