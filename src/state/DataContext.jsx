import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { loadCache, saveCache } from "../services/cache.service";
import * as membersService from "../services/members.service";
import * as familiesService from "../services/families.service";
import * as scheduleService from "../services/schedule.service";
import * as vinculosService from "../services/vinculos.service";
import { findMemberByName } from "../services/families.service";
import { toUpper } from "../utils/formatters";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState(() => loadCache("members") || []);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [familias, setFamilias] = useState(() => loadCache("familias") || []);
  const [loadingFamilias, setLoadingFamilias] = useState(true);
  const [vinculosMinisterios, setVinculosMinisterios] = useState([]);
  const [vinculosProcessos, setVinculosProcessos] = useState([]);
  const [loadingVinculos, setLoadingVinculos] = useState(true);
  const [agenda, setAgenda] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [famColunasExtrasIndisponiveis, setFamColunasExtrasIndisponiveis] = useState(false);
  const [agColunasExtrasIndisponiveis, setAgColunasExtrasIndisponiveis] = useState(false);

  const refetchMembers = useCallback(async () => {
    try {
      const data = await membersService.getMembers();
      setMembers(data);
      saveCache("members", data);
    } catch (e) {
      if (members.length === 0) showToast(e.message, true);
    } finally {
      setLoadingMembers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchFamilias = useCallback(async () => {
    try {
      const data = await familiesService.getFamilias();
      setFamilias(data);
      saveCache("familias", data);
    } catch (e) {
      if (familias.length === 0) showToast(e.message, true);
    } finally {
      setLoadingFamilias(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchVinculos = useCallback(async () => {
    try {
      const { vinculosMinisterios: min, vinculosProcessos: proc } = await vinculosService.getVinculos();
      setVinculosMinisterios(min);
      setVinculosProcessos(proc);
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setLoadingVinculos(false);
    }
  }, [showToast]);

  const refetchAgenda = useCallback(async () => {
    try {
      const data = await scheduleService.getAgenda();
      setAgenda(data);
    } catch (e) {
      showToast(e.message, true);
      setAgenda([]);
    } finally {
      setLoadingAgenda(false);
    }
  }, [showToast]);

  // Bootstrap: ao logar, busca tudo em paralelo e garante o processo "Acolher" padrao.
  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      await Promise.all([refetchMembers(), refetchVinculos(), refetchAgenda(), refetchFamilias()]);
      if (!active) return;
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Garante processo "Acolher" para membros sem nenhum processo, sempre que membros/vinculos mudam.
  useEffect(() => {
    if (!session || loadingMembers || loadingVinculos) return;
    (async () => {
      try {
        const added = await vinculosService.ensureDefaultAcolher(members, vinculosProcessos);
        if (added.length) setVinculosProcessos((prev) => prev.concat(added));
      } catch (e) {
        showToast(e.message, true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loadingMembers, loadingVinculos, members.length]);

  const saveMember = useCallback(async (payload, id) => {
    try {
      await membersService.saveMember(payload, id);
      showToast(id ? "Membro atualizado." : "Membro cadastrado.");
      await refetchMembers();
      return true;
    } catch (e) {
      showToast(e.message, true);
      return false;
    }
  }, [refetchMembers, showToast]);

  // Salva um membro e, se um nome de vinculo familiar foi digitado no formulario,
  // resolve/])cria a familia correspondente antes de persistir o membro.
  const saveMemberComFamilia = useCallback(async (payload, vinculoNomeDigitado, papelFamilia, id, familiaAtualId) => {
    let familiaId = familiaAtualId || null;
    const nomeDigitado = String(vinculoNomeDigitado || "").trim();
    if (nomeDigitado) {
      const alvo = findMemberByName(members, nomeDigitado, id);
      if (!alvo) {
        showToast('Membro "' + nomeDigitado + '" não encontrado na lista — vínculo de família não foi alterado.', true);
      } else {
        try {
          familiaId = await familiesService.resolveFamiliaViaVinculo({
            familiaAtualId: familiaId,
            targetMember: alvo,
            onFamiliaCriada: (nova) => setFamilias((prev) => [...prev, nova]),
            onMembroAtualizado: (memberId, famId) => {
              setMembers((prev) => prev.map((mb) => (mb.id === memberId ? { ...mb, familia_id: famId } : mb)));
            },
          });
        } catch (e) {
          showToast(e.message, true);
        }
      }
    }
    payload.familia_id = familiaId;
    payload.papel_familia = familiaId ? (papelFamilia || null) : null;
    return saveMember(payload, id);
  }, [members, saveMember, showToast]);

  const deleteMember = useCallback(async (id) => {
    try {
      await membersService.deleteMember(id);
      showToast("Membro excluido.");
      await refetchMembers();
    } catch (e) {
      showToast(e.message, true);
    }
  }, [refetchMembers, showToast]);

  const saveFamilia = useCallback(async (payload, id) => {
    try {
      const { data, colunasExtrasIndisponiveis } = await familiesService.saveFamilia(payload, id);
      setFamColunasExtrasIndisponiveis(colunasExtrasIndisponiveis);
      setFamilias((prev) => (id ? prev.map((f) => (f.id === id ? { ...f, ...data } : f)) : [...prev, data]));
      if (colunasExtrasIndisponiveis) {
        showToast('Família salva, mas bairro/líder/grupo não foram gravados: adicione as colunas "bairro_familia", "lider_familia" e "grupo_familia" (text) na tabela familias do Supabase.', true);
      } else {
        showToast(id ? "Família atualizada." : "Família cadastrada.");
      }
      return true;
    } catch (e) {
      showToast(e.message, true);
      return false;
    }
  }, [showToast]);

  const deleteFamiliaAction = useCallback(async (id, nome) => {
    const membros = members.filter((m) => m.familia_id === id);
    if (membros.length > 0) {
      showToast("Remova os " + membros.length + " membro(s) desta família antes de excluí-la.", true);
      return;
    }
    if (!window.confirm('Excluir a família "' + nome + '"? Essa ação não pode ser desfeita.')) return;
    try {
      await familiesService.deleteFamilia(id);
      setFamilias((prev) => prev.filter((f) => f.id !== id));
      showToast("Família excluída.");
    } catch (e) {
      showToast(e.message, true);
    }
  }, [members, showToast]);

  const removeMemberFromFamilia = useCallback(async (memberId) => {
    try {
      await familiesService.removeMemberFromFamilia(memberId);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, familia_id: null, papel_familia: null } : m)));
      showToast("Membro desvinculado da família.");
    } catch (e) {
      showToast(e.message, true);
    }
  }, [showToast]);

  const toggleVinculo = useCallback(async (tipo, membroId, valor, checked) => {
    try {
      const result = await vinculosService.toggleVinculo(tipo, membroId, valor, checked);
      if (tipo === "ministerio") {
        setVinculosMinisterios((prev) =>
          result.added ? [...prev, result.added] : prev.filter((v) => !(v.membro_id === membroId && v.ministerio === valor))
        );
      } else {
        setVinculosProcessos((prev) =>
          result.added ? [...prev, result.added] : prev.filter((v) => !(v.membro_id === membroId && v.processo === valor))
        );
      }
    } catch (e) {
      showToast(e.message, true);
    }
  }, [showToast]);

  const saveAgendaEvent = useCallback(async (payload, id) => {
    try {
      const { colunasExtrasIndisponiveis } = await scheduleService.saveAgendaEvent(payload, id);
      setAgColunasExtrasIndisponiveis(colunasExtrasIndisponiveis);
      if (colunasExtrasIndisponiveis) {
        showToast('Evento salvo, mas horário/categoria não foram gravados: adicione as colunas "horario" (time) e "categoria" (text) na tabela agendamentos do Supabase.', true);
      } else {
        showToast(id ? "Evento atualizado." : "Evento criado.");
      }
      await refetchAgenda();
      return true;
    } catch (e) {
      showToast(e.message, true);
      return false;
    }
  }, [refetchAgenda, showToast]);

  const deleteAgendaEvent = useCallback(async (id, titulo) => {
    if (!window.confirm('Excluir o evento "' + titulo + '"? Essa acao nao pode ser desfeita.')) return;
    try {
      await scheduleService.deleteAgendaEvent(id);
      showToast("Evento excluido.");
      await refetchAgenda();
    } catch (e) {
      showToast(e.message, true);
    }
  }, [refetchAgenda, showToast]);

  return (
    <DataContext.Provider
      value={{
        members, loadingMembers, refetchMembers, saveMember, saveMemberComFamilia, deleteMember,
        familias, loadingFamilias, famColunasExtrasIndisponiveis, saveFamilia, deleteFamiliaAction, removeMemberFromFamilia,
        vinculosMinisterios, vinculosProcessos, loadingVinculos, toggleVinculo,
        agenda, loadingAgenda, agColunasExtrasIndisponiveis, saveAgendaEvent, deleteAgendaEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}

export { toUpper };
