import React, { useState } from 'react';
import { X } from 'lucide-react';
import { 
    StatusTarefa, 
    COLUMNS 
} from '../pages/TelaKanbanBoard'; 

interface NewTaskModalProps {
    status: StatusTarefa;
    // onSave recebe o título digitado e o status da coluna
    onSave: (titulo: string, status: StatusTarefa) => void; 
    onClose: () => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ status, onClose, onSave }) => {
    const [titulo, setTitulo] = useState('');
    
    // Usa a constante COLUMNS importada para obter o nome da coluna
    const getColumnTitle = (s: StatusTarefa) => {
        const column = COLUMNS.find(c => c.status === s);
        return column ? column.title : 'Nova Tarefa';
    };

    const handleSave = () => {
        if (titulo.trim()) {
            onSave(titulo, status); 
            // A função onSave (em KanbanBoard.tsx) é responsável por fechar o modal
        }
    };

    return (
        // Overlay do Modal - Fundo escuro
        <div className="modal-overlay" onClick={onClose}>
            {/* Modal Box - Onde o conteúdo fica */}
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Criar Tarefa em: {getColumnTitle(status)}</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <label htmlFor="task-title">Título da Tarefa</label>
                    <input 
                        id="task-title"
                        type="text" 
                        value={titulo} 
                        onChange={(e) => setTitulo(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                        placeholder="Digite o título da nova tarefa..."
                        autoFocus
                    />
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSave} className="btn-primary" disabled={!titulo.trim()}>
                        Criar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewTaskModal;