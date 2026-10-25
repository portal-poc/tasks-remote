import type { MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { Link } from '@portal-poc/ds';
import { usePlatform } from '@portal-poc/platform-runtime';

/**
 * Breadcrumb to the host's home page. Integrated: `/` of the shared router (the host's blocker guards it). Bridge: our
 * router's `/` is our own root, so the link is a plain `href="/"` (middle click, "open in new tab" go to the portal)
 * and a click asks the host to navigate (`navigateToHost`, guarded by the host's blocker too).
 */
export const PortalHomeLink = () => {
  const { bridge } = usePlatform();
  if (!bridge) {
    return (
      <Link component={RouterLink} to="/">
        Portal
      </Link>
    );
  }
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    bridge.navigateToHost('/');
  };
  return (
    <Link href="/" onClick={handleClick}>
      Portal
    </Link>
  );
};
