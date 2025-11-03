/**
 * Utility functions for formatting seat numbers
 * Converts numeric seat numbers (1, 2, 3...) to letter-number format (A1, A2, B1...)
 */

/**
 * Convert numeric seat number to letter-number format
 * @param {number} seatNumber - The numeric seat number (1, 2, 3...)
 * @returns {string} Formatted seat label (A1, A2, B1...)
 */
export const formatSeatNumber = (seatNumber) => {
  if (!seatNumber || typeof seatNumber !== 'number') {
    return seatNumber;
  }
  
  // Calculate row letter (A, B, C, D, E, F...)
  // Each row has 6 seats
  const rowLetter = String.fromCharCode(65 + Math.floor((seatNumber - 1) / 6)); // A-F
  // Calculate column number (1-6)
  const colNumber = ((seatNumber - 1) % 6) + 1; // 1-6
  
  return `${rowLetter}${colNumber}`;
};

/**
 * Format an array of seat numbers
 * @param {number[]} seatNumbers - Array of numeric seat numbers
 * @returns {string} Comma-separated formatted seat labels
 */
export const formatSeatNumbers = (seatNumbers) => {
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return '';
  }
  
  return seatNumbers
    .map(seat => formatSeatNumber(seat))
    .sort((a, b) => {
      // Sort by row first, then by column
      const rowA = a.charCodeAt(0);
      const rowB = b.charCodeAt(0);
      if (rowA !== rowB) return rowA - rowB;
      return parseInt(a.substring(1)) - parseInt(b.substring(1));
    })
    .join(', ');
};

/**
 * Convert formatted seat label back to numeric seat number
 * @param {string} seatLabel - Formatted seat label (A1, B2, etc.)
 * @returns {number} Numeric seat number
 */
export const parseSeatLabel = (seatLabel) => {
  if (!seatLabel || typeof seatLabel !== 'string') {
    return null;
  }
  
  const match = seatLabel.match(/^([A-Z])(\d+)$/);
  if (!match) {
    return null;
  }
  
  const rowLetter = match[1];
  const colNumber = parseInt(match[2]);
  const rowIndex = rowLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
  
  return rowIndex * 6 + colNumber;
};

