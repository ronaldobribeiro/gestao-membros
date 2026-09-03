export const TABLE = "membresia";
export const TABELA_PAGE_SIZE = 15;
export const MIN_TABLE = "membro_ministerios";
export const PROC_TABLE = "membro_processos";
export const AG_TABLE = "agendamentos";
export const FAM_TABLE = "familias";
export const ALLOWLIST_TABLE = "usuarios_permitidos";
export const IDLE_LIMIT_MS = 20 * 60 * 1000;

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const IGREJAS = ["IPI Cavallari", "Congregação Vera Cruz"];
export const TIPOS_MEMBRO = ["Membro Professo", "Não professos", "Frequentes"];
export const RECEBIDO_POR_OPCOES = ["Transferência", "Jurisdição", "Batismo", "Batismo e Profissão de Fé", "Frequentes"];
export const MOTIVOS_DESLIGAMENTO = ["Renúncia expressa", "Transferência", "Jurisdição assumida", "Abandono", "Exclusão disciplinar", "Falecimento"];
export const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const PAPEL_FAMILIA_OPCOES = ["Pai", "Mãe", "Sogro", "Sogra", "Cônjuge", "Esposo", "Esposa", "Filho(a)", "Dependente", "Outro"];

export const AG_CATEGORIAS = [
  { key: "culto", label: "Culto", color: "#009be7" },
  { key: "reuniao", label: "Reunião", color: "#393bd8" },
  { key: "estudo", label: "Estudo / Discipulado", color: "#00acbd" },
  { key: "visita", label: "Visita Pastoral", color: "#C0447B" },
  { key: "social", label: "Social / Confraternização", color: "#00ba8d" },
  { key: "especial", label: "Evento especial", color: "#8B5CF6" },
  { key: "outro", label: "Outro", color: "#8D91AC" },
];
export function agCategoryInfo(key) {
  return AG_CATEGORIAS.find((c) => c.key === key) || { key: "", label: "Sem categoria", color: "#8D91AC" };
}

export const MINISTERIOS_LIST = ["Pastores", "Presbíteros", "Diáconos e Acolhimento", "Cursos da Família", "Repense", "Louvor e Mídia", "Ministério Infantil", "Torre de Oração", "Jovens e Adolescentes"];
export const PROCESSOS_LIST = ["Acolher", "Formar", "Servir"];

export const CAT_COLORS = ["#00ba8d", "#00acbd", "#009be7", "#0085ff", "#0068fb", "#393bd8", "#8B5CF6", "#C0447B", "#E08E45", "#009be7", "#00ba8d", "#393bd8"];

export const FIELDS = [
  { key: "nome_completo", label: "Nome completo", type: "text", required: true, full: true },
  { key: "sexo", label: "Sexo", type: "select", options: ["Masculino", "Feminino"] },
  { key: "dt_nascimento", label: "Nascimento", type: "date" },
  { key: "estado_civil", label: "Estado civil", type: "select", options: ["Solteiro(a)", "Casado(a)", "Viuvo(a)", "Divorciado(a)", "Uniao estavel"] },
  { key: "conjuge", label: "Conjuge", type: "text" },
  { key: "profissao", label: "Profissao", type: "text" },
  { key: "naturalidade", label: "Naturalidade", type: "text" },
  { key: "nacionalidade", label: "Nacionalidade", type: "text" },
  { key: "pai", label: "Nome do pai", type: "text" },
  { key: "mae", label: "Nome da mae", type: "text" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "fone", label: "Telefone fixo", type: "text" },
  { key: "celular", label: "Celular", type: "text" },
  { key: "endereco", label: "Endereco", type: "text", full: true },
  { key: "bairro", label: "Bairro", type: "text" },
  { key: "cep", label: "CEP", type: "text" },
  { key: "membresia_igreja", label: "Igreja", type: "select", options: IGREJAS, required: true },
  { key: "situacao_membro", label: "Situacao", type: "select", options: ["Ativo", "Inativo"] },
  { key: "status_membro", label: "Tipo de membro", type: "select", options: TIPOS_MEMBRO },
  { key: "dt_entrada", label: "Data de entrada", type: "date" },
  { key: "recebido_por", label: "Recebido por", type: "select", options: RECEBIDO_POR_OPCOES },
  { key: "dt_profissao_fe", label: "Data profissao de fe", type: "date" },
  { key: "igreja_anterior", label: "Igreja anterior", type: "text" },
  { key: "data_desligamento", label: "Data de desligamento", type: "date", editOnly: true },
  { key: "motivo_desligamento", label: "Motivo do desligamento", type: "select", options: MOTIVOS_DESLIGAMENTO, editOnly: true },
];

export const PRINT_FIELDS = [
  { key: "nome_completo", label: "Nome" },
  { key: "assinatura", label: "Assinatura (coluna em branco)" },
  { key: "telefone", label: "Telefone / Celular" },
  { key: "email", label: "E-mail" },
  { key: "endereco", label: "Endereco" },
  { key: "dt_nascimento", label: "Nascimento" },
  { key: "membresia_igreja", label: "Igreja" },
  { key: "situacao_membro", label: "Situacao" },
  { key: "status_membro", label: "Tipo de membro" },
  { key: "familia", label: "Família" },
];

export const CADASTRO_PUBLICO_FIELDS = [
  { section: "Dados pessoais" },
  { key: "nome_completo", label: "Nome completo", type: "text", required: true, full: true },
  { key: "sexo", label: "Sexo", type: "select", options: ["Masculino", "Feminino"] },
  { key: "dt_nascimento", label: "Nascimento", type: "date" },
  { key: "estado_civil", label: "Estado civil", type: "select", options: ["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)", "União estável"] },
  { key: "conjuge", label: "Cônjuge", type: "text" },
  { key: "profissao", label: "Profissão", type: "text" },
  { key: "naturalidade", label: "Naturalidade", type: "text" },
  { key: "nacionalidade", label: "Nacionalidade", type: "text" },
  { key: "pai", label: "Nome do pai", type: "text" },
  { key: "mae", label: "Nome da mãe", type: "text" },
  { section: "Contato" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "fone", label: "Telefone fixo", type: "text" },
  { key: "celular", label: "Celular", type: "text" },
  { key: "endereco", label: "Endereço", type: "text", full: true },
  { key: "bairro", label: "Bairro", type: "text" },
  { key: "cep", label: "CEP", type: "text" },
  { section: "Igreja" },
  { key: "membresia_igreja", label: "Igreja", type: "select", options: IGREJAS, required: true, full: true },
  { key: "igreja_anterior", label: "Igreja anterior (se houver)", type: "text", full: true },
];
