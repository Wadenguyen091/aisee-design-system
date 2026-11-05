import { useEffect, useRef, useState } from 'react';

/** AISEE boot screen: a quiet wordmark with one focused progress line. */
export type ApplicationLoadingProps = {
  detail?: string;
  fixed?: boolean;
  leaving?: boolean;
  className?: string;
};

const HALF_LIFE_MS = 1600;

export function ApplicationLoading({ detail = 'Đang mở AISEE', fixed = false, leaving = false, className = '' }: ApplicationLoadingProps) {
  const startedAt = useRef(Date.now());
  const [eased, setEased] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      setEased(90 * (1 - Math.pow(0.5, elapsed / HALF_LIFE_MS)));
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  const value = leaving ? 100 : Math.min(90, Math.max(0, eased));

  return <div
    className={`vault-boot${fixed ? ' is-fixed' : ''}${leaving ? ' is-leaving' : ''} ${className}`.trim()}
    data-theme-scope="dark"
    role="progressbar"
    aria-label={detail}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
  >
    <div className="vault-boot__content">
      <span className="vault-boot__brand" aria-hidden="true">AISEE</span>
      <div className="vault-boot__track" aria-hidden="true">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>;
}
