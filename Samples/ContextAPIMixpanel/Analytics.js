import React from 'react';
import { Mixpanel } from 'mixpanel-react-native';

const MixpanelContext = React.createContext();

export const useMixpanel = () => React.useContext(MixpanelContext);

export const MixpanelProvider = ({children}) => {
  const [mixpanel, setMixpanel] = React.useState(null);

  React.useEffect(() => {
    const mixpanelInstance = new Mixpanel(`Your Project Token`);
    mixpanelInstance.init();
    setMixpanel(mixpanelInstance);
  }, []);

  return <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>;
};