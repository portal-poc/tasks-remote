import { useState } from 'react';
import { Button, Typography } from '@portal/ds';
import { usePlatformAuth } from '@portal/platform-runtime';

const FOREIGN_SCOPE = 'api://host-bff/Host.Admin';

/** Scenario 11: a remote asking for a scope outside its allowlist gets a clear error (also sent to telemetry). */
export const ForbiddenScopeDemo = () => {
  const auth = usePlatformAuth();
  const [message, setMessage] = useState<string | null>(null);

  const requestForeignScope = async () => {
    try {
      await auth.getAccessToken([FOREIGN_SCOPE]);
      setMessage('Token issued (standalone mode has no allowlist).');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div>
      <Button size="sm" variant="outlined" color="neutral" onClick={requestForeignScope}>
        Request foreign scope
      </Button>
      {message && <Typography level="body-xs">{message}</Typography>}
    </div>
  );
};
