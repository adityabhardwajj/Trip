export const formatSeatNumber = (seatNumber) => {
  if (!seatNumber || typeof seatNumber !== 'number') {
    return seatNumber;
  }
  
  const rowLetter = String.fromCharCode(65 + Math.floor((seatNumber - 1) / 6));
  const colNumber = ((seatNumber - 1) % 6) + 1;
  
  return `${rowLetter}${colNumber}`;
};

export const formatSeatNumbers = (seatNumbers) => {
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return '';
  }
  
  return seatNumbers
    .map(seat => formatSeatNumber(seat))
    .sort((a, b) => {
      const rowA = a.charCodeAt(0);
      const rowB = b.charCodeAt(0);
      if (rowA !== rowB) return rowA - rowB;
      return parseInt(a.substring(1)) - parseInt(b.substring(1));
    })
    .join(', ');
};

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
  const rowIndex = rowLetter.charCodeAt(0) - 65;
  
  return rowIndex * 6 + colNumber;
};

