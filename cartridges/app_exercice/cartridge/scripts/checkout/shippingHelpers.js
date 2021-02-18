var baseModule = module.superModule;

var ShippingMgr = require("dw/order/ShippingMgr");
var ShippingMethodModel = require("*/cartridge/models/shipping/shippingMethod");

var collections = require("*/cartridge/scripts/util/collections");

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @param {Object} [address] - optional address object
 * @returns {dw.util.Collection} an array of ShippingModels
 */
function getApplicableShippingMethods(shipment, address) {
    if (!shipment) return null;

    var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);

    var shippingMethods;
    if (address) {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods(address);
    } else {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods();
    }

    // Filter out whatever the method associated with in store pickup
    var filteredMethods = [];
    collections.forEach(shippingMethods, function (shippingMethod) {
        filteredMethods.push(new ShippingMethodModel(shippingMethod, shipment));
    });

    return filteredMethods;
}

baseModule.getApplicableShippingMethods = getApplicableShippingMethods;

module.exports = baseModule;
