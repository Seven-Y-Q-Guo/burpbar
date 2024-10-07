export const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

export const isValidFormData = (urlString) => {
  return urlString.split("&").every((item) => item.split("=").length === 2);
};
