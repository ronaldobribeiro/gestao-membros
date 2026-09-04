import { useState } from "react";
import { useData } from "../state/DataContext";
import { useModals } from "../state/ModalsContext";
import { normalizeName } from "../utils/normalizers";
import { familiaAvatarColor, familiaIniciais, familiaStatus, getResponsavelFamilia } from "../utils/familyHelpers";

import { DotsIcon, PencilIcon, UserPlusIcon, CalendarIcon, TrashIcon, PhoneIcon } from "./icons/NavIcons";

export default function FamiliaCard({ f, nomesDuplicados }) {
  const { members, deleteFamiliaAction, removeMemberFromFamilia } = useData();
  const { openFamiliaModal, openAdicionarMembroFamilia, openAgendarVisitaFamilia, openMemberModalById } = useModals();
  const [menuOpen, setMenuOpen] = useState(false);

  const responsavel = getResponsavelFamilia(f, members);
  const status = familiaStatus(f);
  const isDupName = nomesDuplicados.has(normalizeName(f.nome_familia));
  const responsavelSuffix = isDupName && responsavel ? " (" + (responsavel.nome_completo || "").split(" ")[0] + ")" : "";
  const avColor = familiaAvatarColor(f);
  const contatoFone = responsavel ? (responsavel.celular || responsavel.fone) : null;

  return (
    <div className={"fam-card2" + (f.duplicado ? " fam-card-duplicate" : "") + (status === "pendente" ? " fam-card-pendente" : "")}>
      <div className="fam-card2-head">
        <span className="fam-avatar" style={{ background: `color-mix(in srgb, ${avColor} 20%, white)`, color: avColor }}>{familiaIniciais(f)}</span>
        <div className="fam-card2-title">
          <div className="fam-card2-name">{f.nome_familia || "Família sem nome"}{responsavelSuffix}</div>
          <div className="fam-card2-meta">
            <span className={"fam-status-badge is-" + status}><span className="dot"></span>{status === "ativo" ? "Ativo" : "Pendente"}</span>
            {f.duplicado ? <span className="fam-dup-badge2" title="Um ou mais membros desta família também estão vinculados a outra família">⚠ Duplicidade</span> : null}
          </div>
        </div>
        <div className="fam-menu-wrap">
          <button type="button" className="fam-menu-btn" title="Mais ações" onClick={() => setMenuOpen((v) => !v)}><DotsIcon /></button>
          {menuOpen ? (
            <div className="fam-menu">
              <button type="button" className="fam-menu-item" onClick={() => { setMenuOpen(false); openFamiliaModal(f); }}><PencilIcon /><span>Editar</span></button>
              <button type="button" className="fam-menu-item" onClick={() => { setMenuOpen(false); openAdicionarMembroFamilia(f); }}><UserPlusIcon /><span>Adicionar membro</span></button>
              <button type="button" className="fam-menu-item" onClick={() => { setMenuOpen(false); openAgendarVisitaFamilia(f); }}><CalendarIcon /><span>Agendar visita</span></button>
              <div className="fam-menu-sep"></div>
              <button type="button" className="fam-menu-item danger" onClick={() => { setMenuOpen(false); deleteFamiliaAction(f.id, f.nome_familia); }}><TrashIcon /><span>Excluir</span></button>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <div className="fam-section-label">{f.membros.length}{f.membros.length === 1 ? " membro" : " membros"}</div>
        {f.membros.length === 0 ? (
          <div className="fam-card2-empty">Nenhum membro vinculado ainda.</div>
        ) : (
          <div className="fam-members2">
            {f.membros.map((m) => (
              <div className={"fam-member-row2" + (m.duplicado ? " fam-member-duplicate" : "")} key={m.id}>
                <div className="fam-member-row2-main">
                  <span className="fam-member-row2-name">{m.nome_completo || "—"}</span>
                  {m.papel_familia ? <span className="fam-member-row2-papel">{m.papel_familia}</span> : null}
                  {m.duplicado ? <span className="fam-dup-badge2" title="Este nome também aparece vinculado a outra família">Em outra família</span> : null}
                </div>
                <div className="fam-member-row2-actions">
                  <button className="fam-mini-icon-btn" title="Editar membro" onClick={() => openMemberModalById(m.id)}><PencilIcon /></button>
                  <button className="fam-mini-icon-btn" title="Desvincular da família" onClick={() => removeMemberFromFamilia(m.id)}>&times;</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fam-info-grid">
        <div className="fam-info-row">
          <PhoneIcon />
          {contatoFone ? (
            <span><span className="fam-info-label">Contato:</span>{(responsavel.nome_completo || "").split(" ")[0]} · <a href={"tel:" + String(contatoFone).replace(/[^\d+]/g, "")}>{contatoFone}</a></span>
          ) : <span className="fam-info-empty">Nenhum contato principal definido</span>}
        </div>
      </div>
    </div>
  );
}
