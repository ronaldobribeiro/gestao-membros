// Grupo de chips de filtro multi-selecao (situacao, tipo etc.).
export default function ChipGroup({ options, selected, onToggle }) {
  return options.map((o) => (
    <button
      key={o}
      type="button"
      className={"chip-toggle " + (selected.includes(o) ? "active" : "")}
      onClick={() => onToggle(o)}
    >
      {o}
    </button>
  ));
}
