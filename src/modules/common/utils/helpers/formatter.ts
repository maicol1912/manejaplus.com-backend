const formattDateList = (date: string[]) => {
  let [year, month, day] = date;

  month = String(month).length == 1 ? `0${month}` : String(month);
  day = String(day).length == 1 ? `0${day}` : String(day);

  return `${year}-${month}-${day}`;
};

const formatMoney = (value: number | string) => {
  const money = new Intl.NumberFormat('es-CO', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
  return `$${money}`;
};

const formatName = (fullName: string) => {
  const cleanName = fullName.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
  if (!cleanName) return '';

  const nameParts = cleanName.split(' ');

  if (nameParts.length === 1) {
    return nameParts[0];
  }

  const firstName = nameParts[0];
  let firstLastName = '';

  if (nameParts.length >= 3) {
    firstLastName = nameParts[2];
  } else if (nameParts.length === 2) {
    firstLastName = nameParts[1];
  }
  return `${firstName} ${firstLastName}`.trim();
};

export { formattDateList, formatMoney, formatName };
