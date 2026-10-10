import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { AppData, BackupEnvelope, ExamDay, Student } from '../types';

const META_KEY = 'avto_backup_meta';
const BACKUP_APP_ID = 'ekzameny' as const;
const BACKUP_VERSION = 1;

export type BackupMeta = {
  savedAt: string;
  studentsCount: number;
  fileName: string;
};

export function getBackupMeta(): BackupMeta | null {
  const raw = localStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackupMeta;
  } catch {
    return null;
  }
}

export function setBackupMeta(meta: BackupMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function backupFileName(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `ekzameny-${dd}-${mm}-${yyyy}.json`;
}

export function formatBackupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export function isShareCanceled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancel/i.test(message);
}

export function parseBackup(raw: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Файл повреждён или это не JSON');
  }

  if (isBackupEnvelope(parsed)) {
    return normalizeAppData(parsed.data);
  }
  if (isAppData(parsed)) {
    return normalizeAppData(parsed);
  }
  throw new Error('Этот файл не похож на копию приложения «Экзамены»');
}

export async function shareBackup(data: AppData): Promise<BackupMeta> {
  const envelope = buildBackup(data);
  const json = JSON.stringify(envelope, null, 2);
  const fileName = backupFileName();

  if (Capacitor.isNativePlatform()) {
    const written = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: 'Копия данных «Экзамены»',
      files: [written.uri],
      dialogTitle: 'Сохранить в облако',
    });
  } else {
    const file = new File([json], fileName, { type: 'application/json' });
    if (canShareFile(file)) {
      await navigator.share({
        title: 'Копия данных «Экзамены»',
        files: [file],
      });
    } else {
      downloadJson(json, fileName);
    }
  }

  const meta: BackupMeta = {
    savedAt: envelope.exportedAt,
    studentsCount: data.students.length,
    fileName,
  };
  setBackupMeta(meta);
  return meta;
}

export async function readBackupFile(file: File): Promise<AppData> {
  const raw = await file.text();
  return parseBackup(raw);
}

function buildBackup(data: AppData): BackupEnvelope {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

function canShareFile(file: File): boolean {
  return typeof navigator !== 'undefined'
    && typeof navigator.share === 'function'
    && typeof navigator.canShare === 'function'
    && navigator.canShare({ files: [file] });
}

function downloadJson(json: string, fileName: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isBackupEnvelope(value: unknown): value is BackupEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as BackupEnvelope;
  if (envelope.app && envelope.app !== BACKUP_APP_ID) return false;
  return isAppData(envelope.data);
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const data = value as AppData;
  return Array.isArray(data.students) && Array.isArray(data.examDays);
}

function normalizeAppData(data: AppData): AppData {
  return {
    students: data.students.map(normalizeStudent),
    examDays: data.examDays.filter(isExamDay).map((day) => ({
      date: day.date,
      studentIds: day.studentIds.filter((id) => typeof id === 'string'),
    })),
  };
}

function isExamDay(value: ExamDay): boolean {
  return Boolean(value && typeof value.date === 'string' && Array.isArray(value.studentIds));
}

function normalizeStudent(student: Student): Student {
  return {
    id: student.id || crypto.randomUUID(),
    lastName: student.lastName ?? '',
    firstName: student.firstName ?? '',
    patronymic: student.patronymic ?? '',
    birthDate: student.birthDate ?? '',
    attempts: Array.isArray(student.attempts) ? student.attempts : [],
    isActive: student.isActive !== false,
    isHidden: Boolean(student.isHidden),
  };
}
