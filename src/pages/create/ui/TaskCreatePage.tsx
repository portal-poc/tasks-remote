import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from 'react-router';
import {
  Alert,
  AsyncButton,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  PendingRegion,
  Select,
  Stack,
} from '@portal/ds';
import { createTaskInputSchema } from '@/shared/api';
import type { CreateTaskInput } from '@/shared/api';
import { useCreateTask } from '../api/use-create-task';

const DEFAULT_VALUES: CreateTaskInput = { title: '', description: '', status: 'todo' };

export const TaskCreatePage = () => {
  const form = useForm({ resolver: zodResolver(createTaskInputSchema), defaultValues: DEFAULT_VALUES });
  const createTask = useCreateTask();
  const navigation = useNavigation();
  // One flag for all stages: otherwise in the cold case the button "goes out" on 200 while the page has not changed.
  const isBusy = createTask.isPending || navigation.state !== 'idle';

  const submit = (values: CreateTaskInput) => {
    createTask.mutate(values);
  };

  return (
    <PendingRegion isPending={isBusy}>
      <form onSubmit={form.handleSubmit(submit)} noValidate>
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
