import React, { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

interface ActiveAlert {
  active: boolean;
  threat_name?: string;
  source_ip?: string;
  severity?: string;
  protocol?: string;
}

export const ThreatAlertBanner: React.FC = () => {
  const [alert, setAlert] = useState<ActiveAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAlert = () => {
      fetch("/api/user/active-alert")
        .then((res) => res.json())
        .then((data: ActiveAlert) => {
          if (data.active) {
            setAlert(data);
            setDismissed(false);
          } else {
            setAlert(null);
          }
        })
        .catch(() => {});
    };

    checkAlert();
    const interval = setInterval(checkAlert, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!alert || !alert.active || dismissed) return null;

  return (
    <div className="bg-red-950/90 border-b border-red-500/50 px-4 py-2 flex items-center justify-between text-red-200 animate-pulse text-xs font-mono shrink-0 z-30">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-red-400 shrink-0" />
        <span>
          <strong>ARGUS INTRUSION ALERT:</strong> [{alert.threat_name}] detected from host <strong>{alert.source_ip}</strong> ({alert.protocol || "TCP"})
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-red-900/50 rounded text-red-300 hover:text-white"
        title="Dismiss Alert"
      >
        <X size={14} />
      </button>
    </div>
  );
};
