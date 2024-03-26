function getConfig(name, defaultValue = null) {
  // If inside a docker container, use window.ENV
  if (window.ENV !== undefined) {
    return window.ENV[name] || defaultValue;
  }

  return process.env[name] || defaultValue;
}

export function getBackendUrl() {
  return getConfig("REACT_APP_BACKEND_URL");
}

export function getBackendUrlV1() {
  return getConfig("REACT_APP_BACKEND_URL") + "/v1";
}

export function getSentryKey() {
  return getConfig("REACT_APP_SENTRY_KEY");
}

export function getAWSUrl() {
  return getConfig("REACT_APP_AWS_URL");
}

export function getFrontendUrl() {
  return getConfig("REACT_APP_FRONTEND_URL");
}

export function getHoursCloseTicketsAuto() {
  return getConfig("REACT_APP_HOURS_CLOSE_TICKETS_AUTO");
}

export function getAPPID() {
  return getConfig("REACT_APP_FACEBOOK_APP_ID");
}

export function getVerifyToken() {
  return getConfig("REACT_APP_FACEBOOK_VERIFY_TOKEN");
}

export function getMixpanelToken() {
  return getConfig("REACT_APP_MIXPANEL_TOKEN");
}

export function getSuperUserEmail() {
  return getConfig("REACT_APP_SUPER_USER_EMAIL");
}

export function getSuperCompanyId() {
  return getConfig("REACT_APP_SUPER_COMPANY_ID");
}
