export const formatBrazilianDate = (date?: Date | string, isDateSelector?: boolean): Date => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  let minusHourIndex = 0;
  if(isDateSelector) {
    minusHourIndex = 3
  }
  if (inputDate) {
    const brazilianDate = new Date(inputDate);
    brazilianDate.setUTCHours(brazilianDate.getUTCHours() + minusHourIndex);

    return brazilianDate;
  }

  const now = new Date();
  const brazilianNow = new Date(now);
  brazilianNow.setUTCHours(now.getUTCHours() + minusHourIndex);

  return brazilianNow;
}
