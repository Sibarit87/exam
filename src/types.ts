export type Student = {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string;
  birthDate: string;
  attempts: Attempt[];
  isActive: boolean;
  isHidden: boolean;
};

export type Attempt = {
  date: string;
  number: number;
  result?: 'сдан' | 'не сдан' | 'не явился';
};

export type ExamDay = {
  date: string;
  studentIds: string[];
};

export type AppData = {
  students: Student[];
  examDays: ExamDay[];
};

export type BackupEnvelope = {
  app: 'ekzameny';
  version: number;
  exportedAt: string;
  data: AppData;
};