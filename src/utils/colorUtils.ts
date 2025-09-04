import colorNames from "color-name";

// Convert RGB → HEX
const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const nameToHex: Record<string, string> = {};
const hexToName: Record<string, string> = {};

Object.entries(colorNames).forEach(([name, rgb]) => {
  const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
  nameToHex[name.toLowerCase()] = hex;
  hexToName[hex] = name;
});

export const getColorName = (hex?: string): string => {
  if (!hex) return "";
  return hexToName[hex.toUpperCase()] || hex;
};

export const getColorHex = (name?: string): string => {
  if (!name) return "";
  return nameToHex[name.toLowerCase()] || name;
};

export const cssColorNames = Object.keys(nameToHex).map(
  (name) => name.charAt(0).toUpperCase() + name.slice(1)
);
