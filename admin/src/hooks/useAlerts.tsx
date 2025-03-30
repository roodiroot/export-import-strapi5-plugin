import { useRef, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

// Определяем тип для уведомления
interface Alert {
  id: number;
  timeout: NodeJS.Timeout;
  variant: 'default' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

// Определяем интерфейс для хука
interface UseAlerts {
  alerts: Alert[];
  notify: (title: string, message: string, variant?: Alert['variant']) => void;
  removeAlert: (id: number) => void;
}

const useAlertsImpl = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [idCount, setIdCount] = useState<number>(0);
  const alertsRef = useRef<Alert[]>(alerts);
  alertsRef.current = alerts;

  const removeAlert = (id: number) => {
    const alerts = alertsRef.current;
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      clearTimeout(alert.timeout);
    }

    const alertsFiltered = alerts.filter((a) => a.id !== id);
    setAlerts(alertsFiltered);
  };

  const notify = (title: string, message: string, variant: Alert['variant'] = 'default') => {
    const alert = {
      id: idCount,
      timeout: setTimeout(() => removeAlert(idCount), 8000),
      variant,
      title,
      message,
    };
    setAlerts(alerts.concat(alert));
    setIdCount(idCount + 1);
  };

  return {
    alerts,
    notify,
    removeAlert,
  };
};

export const useAlerts = singletonHook<UseAlerts>(
  { alerts: [], notify: () => {}, removeAlert: () => {} },
  useAlertsImpl
);
