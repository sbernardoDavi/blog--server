// Article types
export type Article = {
  id?: string;
  tema: string;
  autor: string;
  resumo: string;
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type ArticleWithDates = Article & {
  id: string;
  created_at: string;
};

export type ArticleModalProps = {
  article?: Article | null;
  onClose: () => void;
  onSaved: () => void;
};

// Event types
export type Event = {
  id?: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  speaker: string;
  created_at?: string;
  updated_at?: string;
};

export type EventWithDates = Event & {
  id: string;
  created_at: string;
};

export type EventModalProps = {
  event?: Event | null;
  onClose: () => void;
  onSaved: () => void;
};

// Video types
export type Video = {
  id?: string;
  titulo: string;
  conteudo: string;
  url: string;
  created_at?: string;
  updated_at?: string;
};

export type VideoWithDates = Video & {
  id: string;
  created_at: string;
};

export type VideoModalProps = {
  video?: Video | null;
  onClose: () => void;
  onSaved: () => void;
};

// Delete Confirmation Modal types
export type DeleteConfirmModalProps = {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Utility types
export type SortOrder = "asc" | "desc";
export type SortField = "date" | "time";
