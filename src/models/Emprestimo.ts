export interface Emprestimo {
    id: number;
    usuario_id: number;
    livro_id: number;
    data_emprestimo: Date;
    data_devolucao?: Date;
    devolvido: boolean;
}

export interface EmprestimoInput {
    usuario_id: number;
    livro_id: number;
}
