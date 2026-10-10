import { useRef, useState, type CSSProperties } from 'react';
import type { AppData } from '../types';
import {
  formatBackupDate,
  getBackupMeta,
  isShareCanceled,
  readBackupFile,
  shareBackup,
} from '../utils/backup';

interface Props {
  data: AppData;
  onRestore: (data: AppData) => void;
}

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: 16,
};

const primaryButton: CSSProperties = {
  width: '100%',
  background: '#3b82f6',
  color: 'white',
  padding: '14px 16px',
  borderRadius: 12,
  border: 'none',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
};

const secondaryButton: CSSProperties = {
  ...primaryButton,
  background: '#10b981',
};

export default function CloudBackup({ data, onRestore }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'save' | 'restore' | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [meta, setMeta] = useState(getBackupMeta);

  const handleSave = async () => {
    setMessage(null);
    setBusy('save');
    try {
      const nextMeta = await shareBackup(data);
      setMeta(nextMeta);
      setMessage({
        type: 'ok',
        text: 'Выберите Яндекс.Диск, Google Drive или Telegram и сохраните файл. На новом телефоне откройте этот же файл через «Восстановить».',
      });
    } catch (error) {
      if (isShareCanceled(error)) {
        setMessage({ type: 'error', text: 'Сохранение отменено' });
      } else {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Не удалось сохранить копию',
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handlePickFile = () => {
    setMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy('restore');
    try {
      const restored = await readBackupFile(file);
      const currentCount = data.students.length;
      const nextCount = restored.students.length;
      const ok = currentCount > 0
        ? confirm(`На телефоне уже есть данные (${currentCount} курсантов). Они будут заменены копией (${nextCount} курсантов). Продолжить?`)
        : confirm(`Восстановить ${nextCount} курсантов из файла?`);

      if (!ok) {
        setMessage({ type: 'error', text: 'Восстановление отменено' });
        return;
      }

      onRestore(restored);
      setMessage({
        type: 'ok',
        text: `Данные восстановлены: ${nextCount} курсантов, ${restored.examDays.length} экзаменационных дней.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось прочитать файл',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: '#f3f4f6',
          paddingTop: 8,
          paddingBottom: 12,
          marginBottom: 8,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>☁️ Облако</h2>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Перенос данных на новый телефон
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Как это работает</div>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#4b5563', fontSize: 15, lineHeight: 1.5 }}>
          <li>На старом телефоне нажмите «Сохранить в облако» и выберите диск или Telegram.</li>
          <li>Установите приложение на новый телефон.</li>
          <li>Нажмите «Восстановить из облака» и откройте сохранённый файл.</li>
        </ol>
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Текущие данные</div>
        <div style={{ color: '#4b5563', fontSize: 15, marginBottom: 12 }}>
          Курсантов: <b>{data.students.length}</b>
          {' · '}
          Списков экзаменов: <b>{data.examDays.length}</b>
        </div>
        {meta ? (
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            Последняя копия: {formatBackupDate(meta.savedAt)}
            {meta.fileName ? ` (${meta.fileName})` : ''}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            Копию на этом телефоне ещё не сохраняли
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={busy !== null || data.students.length === 0}
          style={{
            ...primaryButton,
            opacity: busy !== null || data.students.length === 0 ? 0.6 : 1,
          }}
        >
          {busy === 'save' ? 'Сохранение…' : 'Сохранить в облако'}
        </button>
        {data.students.length === 0 && (
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>
            Сначала добавьте курсантов — копировать пока нечего
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Новый телефон</div>
        <div style={{ color: '#4b5563', fontSize: 15, marginBottom: 12 }}>
          Откройте файл, который сохранили из этого приложения.
        </div>
        <button
          type="button"
          onClick={handlePickFile}
          disabled={busy !== null}
          style={{
            ...secondaryButton,
            opacity: busy !== null ? 0.6 : 1,
          }}
        >
          {busy === 'restore' ? 'Восстановление…' : 'Восстановить из облака'}
        </button>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>
          Если файла не видно в списке, откройте «Документы» или «Все файлы».
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json,text/plain,.txt"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        />
      </div>

      {message && (
        <div
          style={{
            ...cardStyle,
            background: message.type === 'ok' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'ok' ? '#065f46' : '#991b1b',
            marginBottom: 0,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
