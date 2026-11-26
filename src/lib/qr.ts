/**
 * Deterministic 21x21 QR-like matrix generator for Booking Pass verification.
 * Produces standard 7x7 finder patterns in three corners and encodes the
 * booking reference deterministically into the remaining data cells.
 */
export function generateQrMatrix(value: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const stampFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          matrix[rr][cc] = false;
        } else if (r === 0 || r === 6 || c === 0 || c === 6) {
          matrix[rr][cc] = true;
        } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix[rr][cc] = true;
        } else {
          matrix[rr][cc] = false;
        }
      }
    }
  };

  stampFinder(0, 0);
  stampFinder(0, size - 7);
  stampFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic hash stream from payload string
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++) {
    seed ^= value.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  const nextBit = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) & 1) === 1;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        matrix[r][c] = nextBit();
      }
    }
  }

  return matrix;
}
