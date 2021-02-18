/**
 * Extends cartridges\app_storefront_base\cartridge\controllers\Cart.js
 */
var server = require("server");
server.extend(module.superModule);

server.append("SelectShippingMethod", function (req, res, next) {
    var BasketMgr = require("dw/order/BasketMgr");
    var collections = require("*/cartridge/scripts/util/collections");
    var renderTemplateHelper = require("*/cartridge/scripts/renderTemplateHelper");

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;

    this.on("route:BeforeComplete", function (req, res) {
        // eslint-disable-line no-shadow
        var currentBasket = BasketMgr.getCurrentBasket();
        var viewData = res.getViewData();

        var shipments = currentBasket.getShipments();
        collections.forEach(shipments, function (shipment) {
            if (shipment.UUID == shipmentUUID) {
                var currentShippingMethod = shipment.getShippingMethod();
                if (currentShippingMethod.custom.storePickupEnabled) {
                    var template = "checkout/dhlPickUpForm";
                    viewData.showPickUpPoints = true;
                    viewData.renderTemplateHelper = renderTemplateHelper.getRenderedHtml({}, template);

                }
            }
        });

        res.setViewData(viewData);
    });

    return next();
});

server.post("CheckPickUpPoints", function (req, res, next) {
    var CustomObjectMgr = require("dw/object/CustomObjectMgr");
    var DHLService = require("*/cartridge/scripts/api/DHLService");
    var Locale = require("dw/util/Locale");
    var StringUtils = require("dw/util/StringUtils");

    var currentLocale = Locale.getLocale(req.locale.id);
    var countryCode = currentLocale.country;
    var zipCode = req.form.zipCode;

    var data = {};
    var customObject = CustomObjectMgr.getCustomObject("DHLPickUpPoints", StringUtils.format("{0}_{1}", countryCode, zipCode));
    if (customObject) {
        data = !empty(customObject.custom.data) ? JSON.parse(customObject.custom.data) : {};
    }
    
    if (Object.keys(data).length == 0) {
        data = DHLService.callRestAPI(countryCode, zipCode);
        data = data? data.toArray() : null;
    }

    res.json({storeList: data});
    return next();
});

module.exports = server.exports();
