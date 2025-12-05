import {MixpanelLogger} from "mixpanel-react-native/javascript/mixpanel-logger";

export class MixpanelHttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
  }
}

export const MixpanelNetwork = (() => {
  const sendRequest = async ({
    token,
    endpoint,
    data,
    serverURL,
    useIPAddressForGeoLocation,
    retryCount = 0,
    headers = {},
  }) => {
    retryCount = retryCount || 0;
    // Use & if endpoint already has query params, otherwise use ?
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${serverURL}${endpoint}${separator}ip=${+useIPAddressForGeoLocation}`;
    MixpanelLogger.log(token, `Sending request to: ${url}`);

    try {
      // Determine if this is a GET or POST request based on data presence
      const isGetRequest = data === null || data === undefined;

      const fetchOptions = isGetRequest
        ? {
            method: "GET",
            headers: headers,
          }
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              ...headers,
            },
            body: `data=${encodeURIComponent(JSON.stringify(data))}`,
          };

      const response = await fetch(url, fetchOptions);

      // Handle GET requests differently - they return the data directly
      if (isGetRequest) {
        if (response.status === 200) {
          const responseData = await response.json();
          MixpanelLogger.log(token, `GET request successful: ${endpoint}`);
          return responseData;
        } else {
          throw new MixpanelHttpError(
            `HTTP error! status: ${response.status}`,
            response.status
          );
        }
      } else {
        // Handle POST requests (existing logic)
        const responseBody = await response.json();
        if (response.status !== 200) {
          throw new MixpanelHttpError(
            `HTTP error! status: ${response.status}`,
            response.status
          );
        }

        const message =
          responseBody === 0
            ? `${url} api rejected some items`
            : `Mixpanel batch sent successfully, endpoint: ${endpoint}, data: ${JSON.stringify(
                data
              )}`;

        MixpanelLogger.log(token, message);
        return responseBody;
      }
    } catch (error) {
      // Determine if this is a GET or POST request
      const isGetRequest = data === null || data === undefined;

      // For GET requests (like flags), don't retry on 404 or other client errors
      if (isGetRequest && error.code >= 400 && error.code < 500) {
        MixpanelLogger.log(token, `GET request failed with status ${error.code}, not retrying`);
        throw error;
      }

      // For POST requests or non-client errors, handle retries
      if (error.code === 400) {
        // This indicates that the data was invalid and we should not retry
        throw new MixpanelHttpError(
          `HTTP error! status: ${error.code}`,
          error.code
        );
      }

      MixpanelLogger.warn(
        token,
        `API request to ${url} has failed with reason: ${error.message}`
      );

      // Only retry for POST requests or server errors
      if (!isGetRequest || error.code >= 500) {
        const maxRetries = 5;
        const backoff = Math.min(2 ** retryCount * 2000, 60000); // Exponential backoff
        if (retryCount < maxRetries) {
          MixpanelLogger.log(token, `Retrying in ${backoff / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          return sendRequest({
            token,
            endpoint,
            data,
            serverURL,
            useIPAddressForGeoLocation,
            retryCount: retryCount + 1,
          });
        }
      }

      MixpanelLogger.warn(token, `Request failed. Not retrying.`);
      throw new MixpanelHttpError(
        `HTTP error! status: ${error.code || 'unknown'}`,
        error.code
      );
    }
  };

  return {
    sendRequest,
  };
})();
