import { cargoExpresoAdapter } from "./adapters/cargoExpresoAdapter";
import { shippoAdapter } from "./adapters/shippoAdapter";
import { ShippingProvider } from "./shipping.types";

export function getShippingProvider(country: string): ShippingProvider {
    return country === 'GT' ? cargoExpresoAdapter : shippoAdapter;
}