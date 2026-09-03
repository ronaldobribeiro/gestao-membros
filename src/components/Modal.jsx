// Casca generica de modal: backdrop + cabecalho com titulo/fechar. O conteudo
// (geralmente um <form> cobrindo corpo + rodape) fica a cargo de quem usa o Modal,
// para que o botao "Salvar" (type=submit) funcione dentro do mesmo <form>.
export default function Modal({ title, onClose, children, maxWidth }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
