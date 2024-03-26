export default function isValidURL() {
  const { hostname } = window.location;
  const [companyIdentifier] = hostname.split('.');

  if (companyIdentifier.includes('localhost')) {
    return false
  }

  return true;
}
