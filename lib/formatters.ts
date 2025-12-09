/**
 * Recursively converts BN objects and special objects with _bn or negative properties to strings
 * @param object Any object that might contain BN values or special objects
 * @returns A new object with all BN values converted to strings
 */
export function toObject(object: any): any {
  // Handle null/undefined early
  if (object === null || object === undefined) {
    return object;
  }

  // Handle primitive types
  if (typeof object !== 'object') {
    return object;
  }

  // Handle arrays
  if (Array.isArray(object)) {
    return object.map((item: any) => toObject(item));
  }

  // Handle BigInt values
  if (typeof object === 'bigint') {
    return bigIntToNumber(object);
  }

  // Handle special objects with _bn or negative properties
  if ('_bn' in object && object._bn !== null) {
    return object.toString();
  }

  if ('negative' in object && object.negative !== null) {
    return object.toString();
  }

  // Create a new object to avoid modifying the original
  const result: any = {};

  try {
    Object.keys(object).forEach(key => {
      const value = object[key];

      if (value === null || value === undefined) {
        result[key] = value;
      } else if (typeof value === 'object') {
        // Recursively process nested objects and arrays
        result[key] = toObject(value);
      } else {
        result[key] = value;
      }
    });
  } catch (error) {
    console.error('Error in toObject conversion:', error, 'Object:', object);
    throw error;
  }

  return result;
}

// For u8/i8 (1 byte)
export const u8ToLEBytes = (num: number) => {
  const buf = Buffer.alloc(1);
  buf.writeUInt8(num, 0);
  return buf;
}

// For u16/i16 (2 bytes)
export const u16ToLEBytes = (num: number) => {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(num, 0);
  return buf;
}

// For u32/i32 (4 bytes)
export const u32ToLEBytes = (num: number) => {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(num, 0);
  return buf;
}

// For u64/i64 (8 bytes)
export const u64ToLEBytes = (num: number) => {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(num), 0);
  return buf;
}

/**
 * Converts a BigInt to a number
 * @param value BigInt value to convert
 * @returns Number representation of the BigInt
 * @throws Error if BigInt is outside safe integer range
 */
export const bigIntToNumber = (value: bigint): number => {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error(`BigInt value ${value} is outside safe integer range`);
  }
  return Number(value);
}

