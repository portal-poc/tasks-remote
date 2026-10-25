import type { MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { Link } from '@portal-poc/ds';
import { usePlatform } from '@portal-poc/platform-runtime';

/**
 * Breadcrumb to the host's home page. Integrated: `/` of the shared router (the host's blocker guards it). Bridge: our
 * router's `/` is our own root, so we ask the host to navigate (`navigateToHost`, guarded by the host's blocker too).
 */
export const PortalHomeLink = () => {
  const { bridge } = usePlatform();
  const handleClick = (event: MouseEvent) => {
    if (bridge) {
      event.preventDefault();
      bridge.navigateToHost('/');
    }
  };
  return (
    <Link component={RouterLink} to="/" onClick={handleClick}>
      Portal
    </Link>
  );
};
