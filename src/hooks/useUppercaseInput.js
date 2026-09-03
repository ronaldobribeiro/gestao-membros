// Converte o valor de um input/textarea para maiusculas em tempo real, preservando
// a posicao do cursor — equivalente ao antigo attachUppercaseFields(), mas aplicado
// via handler de input em vez de percorrer o DOM a cada render.
export function handleUpperInput(e) {
  const el = e.target;
  const start = el.selectionStart, end = el.selectionEnd;
  const upper = el.value.toUpperCase();
  if (upper !== el.value) {
    el.value = upper;
    if (start !== null && end !== null && typeof el.setSelectionRange === "function") {
      el.setSelectionRange(start, end);
    }
  }
}
