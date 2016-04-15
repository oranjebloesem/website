var apiGateway = apiGateway || {};
apiGateway.core = apiGateway.core || {};

if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

apiGateway.core.apiGatewayClientFactory = {};
apiGateway.core.apiGatewayClientFactory.newClient = function (simpleHttpClientConfig, sigV4ClientConfig) {
    var apiGatewayClient = { };
    //Spin up 2 httpClients, one for simple requests, one for SigV4
    var sigV4Client = apiGateway.core.sigV4ClientFactory.newClient(sigV4ClientConfig);
    var simpleHttpClient = apiGateway.core.simpleHttpClientFactory.newClient(simpleHttpClientConfig);

    apiGatewayClient.makeRequest = function (request, authType, additionalParams, apiKey) {
        //Default the request to use the simple http client
        var clientToUse = simpleHttpClient;

        //Attach the apiKey to the headers request if one was provided
        if (apiKey !== undefined && apiKey !== '' && apiKey !== null) {
            request.headers['x-api-key'] = apiKey;
        }

        if (request.body === '' || request.body === null ) {
            request.body = undefined;
        }

        // If the user specified any additional headers or query params that may not have been modeled
        // merge them into the appropriate request properties
        request.headers = apiGateway.core.utils.mergeInto(request.headers, additionalParams.headers);
        request.queryParams = apiGateway.core.utils.mergeInto(request.queryParams, additionalParams.queryParams);

        //If an auth type was specified inject the appropriate auth client
        if (authType === 'AWS_IAM') {
            clientToUse = sigV4Client;
        }

        //Call the selected http client to make the request, returning a promise once the request is sent
        return clientToUse.makeRequest(request);
    };
    return apiGatewayClient;
};
