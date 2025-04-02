export interface Loan {
  id?: string;
  motif_restitution: string;
  date_emprunt: Date;
  date_restitution: Date;
  etat_materiel: string;
  materiels: string[];
}
