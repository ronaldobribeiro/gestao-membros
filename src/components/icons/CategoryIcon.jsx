import { catIconPath } from "../../utils/icons";

// Renderiza os paths de MINISTERIOS_LIST/PROCESSOS_LIST. Esses paths sao strings
// SVG fixas definidas em utils/icons.js (nunca vem de dados do usuario), entao usar
// dangerouslySetInnerHTML aqui e seguro — ver nota de seguranca no arquivo de origem.
export default function CategoryIcon({ name, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: catIconPath(name) }}
      {...props}
    />
  );
}
