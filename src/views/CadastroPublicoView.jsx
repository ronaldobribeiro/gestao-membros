import { useState } from "react";
import { sb } from "../api/supabase";
import "../styles/cadastro.css";
import { TABLE, CADASTRO_PUBLICO_FIELDS } from "../config/constants";

function CadastroField({ field: f }) {
  if (f.section) return <div className="section-title">{f.section}</div>;
  const cls = "field" + (f.full ? " full" : "");
  if (f.type === "select") {
    return (
      <div className={cls}>
        <label htmlFor={"fld-" + f.key}>{f.label}{f.required ? " *" : ""}</label>
        <select id={"fld-" + f.key} name={f.key} required={f.required} defaultValue="">
          <option value=""></option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className={cls}>
      <label htmlFor={"fld-" + f.key}>{f.label}{f.required ? " *" : ""}</label>
      <input id={"fld-" + f.key} name={f.key} type={f.type} required={f.required} />
    </div>
  );
}

export default function CadastroPublicoView() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {};
    CADASTRO_PUBLICO_FIELDS.filter((f) => f.key).forEach((f) => {
      let v = fd.get(f.key);
      if (v === "") v = null;
      payload[f.key] = v;
    });
    setSubmitting(true);
    setError("");
    const { error: err } = await sb.from(TABLE).insert(payload);
    setSubmitting(false);
    if (err) {
      setError("Não foi possível enviar seu cadastro. Tente novamente em instantes.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="cadastro-wrap">
        <div className="cadastro-card cadastro-success-card">
          <div className="cadastro-success-icon">✅</div>
          <h2>Cadastro recebido!</h2>
          <p>Obrigado por se cadastrar. A secretaria da igreja irá revisar suas informações e entrar em contato caso seja necessário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-wrap">
      <div className="cadastro-eyebrow">Gestão de Membros</div>
      <h1 className="cadastro-title">Cadastro de Novo Membro</h1>
      <p className="cadastro-sub">Preencha seus dados abaixo. A secretaria completará seu cadastro após revisão.</p>
      <div className="cadastro-card">
        {error ? <div className="error-box">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {CADASTRO_PUBLICO_FIELDS.map((f, i) => <CadastroField key={f.key || "section-" + i} field={f} />)}
          </div>
          <button type="submit" className="btn btn-gold cadastro-submit" disabled={submitting}>{submitting ? "Enviando…" : "Enviar cadastro"}</button>
        </form>
      </div>
    </div>
  );
}
