const getFormattedTimestamp = (strDate) => {
  const timestamp = strDate ? new Date(strDate) : new Date();
  
  const options = {
    // weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const date = timestamp.toLocaleDateString("pt-br", options);

  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return { date, time };
};

export default getFormattedTimestamp;
