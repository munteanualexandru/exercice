"use strict";

var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var Logger = require("dw/system/Logger");
var StringUtils = require("dw/util/StringUtils");
var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var Transaction = require("dw/system/Transaction");

module.exports.callRestAPI = function (country, zipCode) {
    var serviceID = "DHLPickUpPoints";

    var DHLService = LocalServiceRegistry.createService(serviceID, {
        createRequest: function (service, _params) {
            var url = service.getURL();
            var generatedUrl = StringUtils.format("{0}{1}?zipCode={2}", url, country, zipCode);

            service.URL = generatedUrl;
            service.setRequestMethod("GET");

            return service;
        },
        parseResponse: function (service, response) {
            var textResponse = response.getText("UTF-8");
            var jsonResponse = JSON.parse(textResponse);

            if (jsonResponse.length > 0) {
                Transaction.wrap(function () {
                    var customObject = CustomObjectMgr.createCustomObject("DHLPickUpPoints", StringUtils.format("{0}_{1}", country, zipCode));
                    customObject.custom.data = JSON.stringify(jsonResponse);
                });

                return jsonResponse;
            }

            Logger.getLogger("DHLService", "DHLService").error("Failed recive proper response! response={0}", textResponse);
            return null;
        }
    });

    try {
        var result = DHLService.call();

        if (!result.isOk()) {
            Logger.getLogger("DHLService", "DHLService").error("Failed to make request! getErrorMessage={0}", result.getErrorMessage());
            return null;
        }

        return result.getObject();
    } catch (e) {
        Logger.getLogger("DHLService", "DHLService").error("Failed to make request! e={0}", e.toString());
        return null;
    }
};
