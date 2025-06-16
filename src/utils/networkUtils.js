// Network utility functions

export const checkNetworkConnection = async () => {
  try {
    // Try to fetch a small resource to verify actual connectivity
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getConnectionType = () => {
  if ('connection' in navigator) {
    return navigator.connection.effectiveType || 'unknown';
  }
  return 'unknown';
};

export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

export const getNetworkInfo = () => {
  const info = {
    isOnline: navigator.onLine,
    connectionType: getConnectionType(),
    isSlowConnection: isSlowConnection()
  };

  if ('connection' in navigator) {
    const connection = navigator.connection;
    info.downlink = connection.downlink;
    info.rtt = connection.rtt;
    info.saveData = connection.saveData;
  }

  return info;
};
