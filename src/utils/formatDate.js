const dateStyles = {
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
};

const formatDate = (value, style = 'long') => {
  if(!value) return 'Recently';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', dateStyles[style] || dateStyles.long).format(date);
}

export default formatDate;
