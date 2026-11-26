import React from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';
import { useMotionNav } from '../context/MotionNavContext';

interface AnimatedLinkProps extends LinkProps {
  onBeforeNavigate?: () => void;
  delayMs?: number;
}

export function AnimatedLink({
  to,
  onClick,
  onBeforeNavigate,
  delayMs = 0,
  className = '',
  children,
  ...rest
}: AnimatedLinkProps) {
  const { animatedNavigate } = useMotionNav();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      rest.target === '_blank'
    ) {
      return;
    }

    const targetPath = typeof to === 'string' ? to : `${to.pathname || ''}${to.search || ''}${to.hash || ''}`;
    const currentFull = `${location.pathname}${location.search}${location.hash}`;

    e.preventDefault();

    if (targetPath === currentFull) {
      onBeforeNavigate?.();
      return;
    }

    animatedNavigate(targetPath, {
      delayMs,
      onBeforeNavigate,
    });
  };

  return (
    <Link to={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
}
