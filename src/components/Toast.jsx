import { useToast } from "../state/ToastContext";

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  return <div className={"toast " + (toast.isErr ? "err" : "")}>{toast.msg}</div>;
}
