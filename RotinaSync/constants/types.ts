// constants/types.ts

export type Serie = {
  reps: string;
  peso: string;
};

export type Exercicio = {
  nome: string;
  series: Serie[];
};

export type Treino = {
  id: string;
  nome: string;
  exercicios: Exercicio[];
};

export type HistoricoItem = {
  id: string;
  nomeTreino: string;
  data: string;
  duracao: number; // em segundos
  exercicios: {
    nome: string;
    series: { reps: string; peso: string; concluida: boolean }[];
  }[];
  generos?: string[];
};