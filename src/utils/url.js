export const baseUrl =
  process.env.REACT_APP_ENV === "DEV"
    ? process.env.REACT_APP_DEV_URL
    : process.env.REACT_APP_ENV === "STAG"
    ? process.env.REACT_APP_STAGING_URL
    : process.env.REACT_APP_PROD_URL;
