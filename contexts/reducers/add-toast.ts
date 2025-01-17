import { v4 as uuidv4 } from "uuid";

import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";
import { ToastNotification } from "interfaces/toast-notification";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  toaster: [...state.toaster, payload]
});

export const AddToast: ReduceAction<string> = {
  name: ReduceActionName.AddToast,
  fn: reducer
};

export const addToast = (payload: ToastNotification): ReduceActor<ToastNotification> => ({
  name: ReduceActionName.AddToast,
  payload: { type: "primary", delay: 10000, ...payload, id: uuidv4() }
});

export const toastError = (content: string, title = "Error", ...rest) =>
  addToast({ title, content, type: "danger", ...rest });
export const toastSuccess = (content: string, title = "Success") =>
  addToast({ title, content, type: "success" });
export const toastInfo = (content: string, title = "Info") =>
  addToast({ title, content, type: "info" });
export const toastWarning = (content: string, title = "Warning") =>
  addToast({ title, content, type: "warning" });
export const toastPrimary = (content: string, title = "BEPRO") =>
  addToast({ title, content, type: "primary" });
export const toastSecondary = (content: string, title = "Notice") =>
  addToast({ title, content, type: "secondary" });
