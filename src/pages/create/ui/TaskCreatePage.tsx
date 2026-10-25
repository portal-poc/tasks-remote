import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useRef } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useNavigation } from 'react-router';
import {
  Alert,
  AsyncButton,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Modal,
  ModalDialog,
  Option,
  PendingRegion,
  Select,
  Stack,
} from '@portal-poc/ds';
import { useLeaveGuard, usePageTitle } from '@portal-poc/platform-runtime';
import { createTaskInputSchema } from '@/shared/api';
import { PortalHomeLink } from '@/shared/ui';
import type { CreateTaskInput } from '@/shared/api';
import { useCreateTask } from '../api/use-create-task';

const DEFAULT_VALUES: CreateTaskInput = { title: '', description: '', status: 'todo' };

/** After a successful save: back to the list, or on to where the user was going ("Save and leave"). */
type AfterSave = 'list' | 'continue';

export const TaskCreatePage = () => {
  usePageTitle('New task');
  const form = useForm({ resolver: zodResolver(createTaskInputSchema), defaultValues: DEFAULT_VALUES });
  const navigate = useNavigate();
  const afterSave = useRef<AfterSave>('list');

  const createTask = useCreateTask({
    onCreated: async () => {
      // Saved: the navigation that follows is not "leaving with unsaved changes".
      unsaved.release();
      saving.release();
      if (afterSave.current === 'continue') {
        unsaved.leave();
      } else {
        await navigate('..');
      }
    },
  });
  // Three levels of the same guard API: our own dialog while dirty, a lock while saving.
  const unsaved = useLeaveGuard(form.formState.isDirty, { dialog: 'own', message: 'The new task is not saved.' });
  const saving = useLeaveGuard(createTask.isPending, { lock: true, message: 'The task is being saved…' });

  const navigation = useNavigation();
  // One flag for all stages: otherwise in the cold case the button "goes out" on 200 while the page has not changed.
  const isBusy = createTask.isPending || navigation.state !== 'idle';

  const submit = (values: CreateTaskInput) => {
    createTask.mutate(values);
  };

  const saveAndLeave = () => {
    afterSave.current = 'continue';
    // Invalid form: stay and show the errors.
    void form.handleSubmit(submit, unsaved.stay)();
  };

  const saveAndStay = (event: FormEvent) => {
    afterSave.current = 'list';
    void form.handleSubmit(submit)(event);
  };

  return (
    <PendingRegion isPending={isBusy}>
      {/* Breadcrumbs: to the host (another app) and within this one — both guarded while the form is dirty. */}
      <Stack direction="row" gap={1} sx={{ mb: 2 }}>
        <PortalHomeLink />
        <span>/</span>
        <Link component={RouterLink} to="..">
          All tasks
        </Link>
        <span>/</span>
        <span>New task</span>
      </Stack>
      <Modal open={unsaved.state === 'asking'} onClose={unsaved.stay}>
        <ModalDialog role="alertdialog" size="sm">
          <DialogTitle>The new task is not saved</DialogTitle>
          <DialogContent>Save it before going to {unsaved.pathname}?</DialogContent>
          <DialogActions>
            <Button onClick={saveAndLeave} loading={createTask.isPending}>
              Save and leave
            </Button>
            <Button color="danger" variant="soft" onClick={unsaved.leave}>
              Discard
            </Button>
            <Button variant="plain" color="neutral" onClick={unsaved.stay}>
              Stay
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <form onSubmit={saveAndStay} noValidate>
        <Stack gap={2} sx={{ maxWidth: 480 }}>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel>Title</FormLabel>
                <Input {...field} />
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input {...field} />
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onChange={(_event, value) => value && field.onChange(value)}>
                  <Option value="todo">todo</Option>
                  <Option value="in-progress">in-progress</Option>
                  <Option value="done">done</Option>
                </Select>
              </FormControl>
            )}
          />
          {createTask.error && (
            <Alert color="danger" title="Could not create the task">
              {createTask.error.message}
            </Alert>
          )}
          <AsyncButton type="submit" isPending={isBusy}>
            Create task
          </AsyncButton>
        </Stack>
      </form>
    </PendingRegion>
  );
};
