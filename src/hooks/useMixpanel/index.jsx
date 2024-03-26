import mixpanel from "mixpanel-browser";
import isValidURL from "../../helpers/isValidURL";

const useMixpanel = (user) => {
  const isValid = isValidURL();
  const eventQueue = new Set();

  const track = (event, properties) => {
    if (isValid) {
      const eventKey = JSON.stringify({ event, properties });

      if (!eventQueue.has(eventKey)) {
        mixpanel.track(event, properties);

        eventQueue.add(eventKey);

        setTimeout(() => {
          eventQueue.delete(eventKey);
        }, 5000);
      }
    }
  };

  const identify = () => {
    if (isValid && user && user.company && user.id) {
      mixpanel.identify(`${user.company.name}-${user.id}`);
    }
  };

  return {
    track,
    identify,
  };
};

export default useMixpanel;
