import { handleUpperInput } from "../hooks/useUppercaseInput";

// Renderiza um campo do formulario de membro a partir da definicao em FIELDS
// (config/constants.js) — equivalente ao antigo renderField().
export default function MemberFormField({ field: f, defaultValue }) {
  const cls = "field" + (f.full ? " full" : "");
  if (f.type === "select") {
    return (
      <div className={cls}>
        <label htmlFor={"fld-" + f.key}>{f.label}{f.required ? " *" : ""}</label>
        <select id={"fld-" + f.key} name={f.key} required={f.required} defaultValue={defaultValue ?? ""}>
          <option value=""></option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  const upperProps = (f.type === "text" || f.type === "email") ? { onInput: handleUpperInput } : {};
  return (
    <div className={cls}>
      <label htmlFor={"fld-" + f.key}>{f.label}{f.required ? " *" : ""}</label>
      <input id={"fld-" + f.key} name={f.key} type={f.type} required={f.required} defaultValue={defaultValue ?? ""} {...upperProps} />
    </div>
  );
}
