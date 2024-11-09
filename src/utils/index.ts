export const formatUnits = (
  value: string | bigint,
  decimals: number,
): number => {
  // Convert the value to BigInt if it's a string
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value;

  // Calculate the divisor for the specified number of decimal places
  const divisor = BigInt(10 ** decimals);

  // The integer part of the result
  const integerPart = bigIntValue / divisor;

  // The remainder, to calculate the fractional part
  const fractionalPart = bigIntValue % divisor;

  // Format the fractional part, padding with leading zeros if necessary
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');

  // Remove trailing zeros from the fractional part for a cleaner output
  const fractionalCleaned = fractionalStr.replace(/0+$/, '');

  return Number(
    fractionalCleaned
      ? `${integerPart}.${fractionalCleaned}`
      : integerPart.toString(),
  );
};

export const toWeiCustom = (
  value: string | number,
  decimals: number,
): bigint => {
  const valueStr = typeof value === 'number' ? value.toFixed(decimals) : value;
  // Split the value into integer and fractional parts
  const [integerPart, fractionalPart = ''] = valueStr.split('.');

  // Trim or pad the fractional part to the required number of decimal places
  const fractionalPadded = fractionalPart
    .padEnd(decimals, '0')
    .slice(0, decimals);

  // Convert both parts to BigInt and raise the integer part to the power of decimals
  const bigIntIntegerPart = BigInt(integerPart) * BigInt(10 ** decimals);
  const bigIntFractionalPart = BigInt(fractionalPadded);

  // Return the sum of the integer and fractional parts
  return bigIntIntegerPart + bigIntFractionalPart;
};

export const generateRandomString = (length: number): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

export const timestampToDate = (timestamp: number) => {
  return new Date(timestamp * 1000);
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const extractPathWithIpfs = (uri: string) => {
  if (uri.startsWith('ipfs/')) {
    return uri;
  } else {
    const startIndex = uri.indexOf('ipfs/');
    return uri.substring(startIndex);
  }
};

export const bigIntTransformer = {
  to: (value: bigint) => (value !== undefined ? value.toString() : undefined),
  from: (value: string) => value,
};

export const decodeHexTopicToAddress = (topic: string) => {
  if (!topic) return null;

  const hex = topic.replace('0x', '');
  const addressHex = hex.slice(-40);
  return '0x' + addressHex;
};

export const extractAddressesFromLogs = (logs) => {
  const addresses = [];

  logs.forEach((log) => {
    const addressTopic = log.topics[2];
    const decodedAddress = decodeHexTopicToAddress(addressTopic);

    if (decodedAddress) {
      addresses.push(decodedAddress);
    }
  });

  return [...new Set(addresses)];
};

export const roundToPrecision = (
  value: number,
  precision: number = 6,
): number => {
  return Number(value.toFixed(precision));
};
