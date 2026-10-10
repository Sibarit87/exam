import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return ReactDOM.createPortal(children, container);
}