import { deliveryBarangays } from "./deliveryBarangays.js";

const nearbyBarangays = [
  "Badiang",
  "Canturing",
  "Combado",
  "Ibarra",
  "Mambajao",
  "Mantahan",
  "Tunga-tunga",
];

const fartherBarangays = [
  "Bagtican",
  "Cambooc",
  "Laboon",
  "Nasaug",
  "Nati",
  "Pansaan",
  "Pinascohan",
  "San Isidro",
  "San Rafael",
  "Tigbawan",
  "Tomoy-tomoy",
];

export const deliveryFeeByBarangay = Object.fromEntries(
  deliveryBarangays.map((barangay) => [
    barangay,
    nearbyBarangays.includes(barangay) ? 20 : fartherBarangays.includes(barangay) ? 40 : 30,
  ]),
);

export function getDeliveryFee(barangay) {
  return deliveryFeeByBarangay[barangay] ?? 0;
}
