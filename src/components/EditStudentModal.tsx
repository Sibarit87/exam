import { useState } from 'react';
import type { Student } from '../types';

interface Props {
  student: Student;
  onClose: () => void;
  onSave: (studentId: string, updatedData: {
    lastName: string;
    firstName: string;
    patronymic: string;
    birthDate: string;
    attemptNumber?: string;
    lastAttemptDate?: string;
  }) => void;
}

const formatDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
};

export default function EditStudentModal({ student, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    lastName: student.lastName,
    firstName: student.firstName,
    patronymic: student.patronymic || '',
    birthDate: student.birthDate,
    attemptNumber: student.attempts.length > 0 ? String(student.attempts[student.attempts.length - 1].number) : '0',
    lastAttemptDate: student.attempts.length > 0 ? student.attempts[student.attempts.length - 1].date : '',
  });

  const handleDateChange = (field: 'birthDate' | 'lastAttemptDate', value: string) => {
    const formatted = formatDateMask(value);
    setForm({ ...form, [field]: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.lastName || !form.firstName || !form.birthDate) {
      alert('Заполните обязательные поля (ФИО и дата рождения)');
      return;
    }

    const attemptNum = parseInt(form.attemptNumber || '0');
    if (attemptNum > 0 && !form.lastAttemptDate) {
      alert('Если номер попытки больше 0, укажите дату последней попытки');
      return;
    }

    // Проверка: если есть попытки и новый номер не равен последнему+1, то предупреждение
    if (student.attempts.length > 0) {
      const lastNumber = student.attempts[student.attempts.length - 1].number;
      const expected = lastNumber + 1;
      if (attemptNum !== expected) {
        if (!confirm(`Вы уверены, что хотите изменить номер последней попытки на ${attemptNum}? Все номера попыток будут пересчитаны по порядку.`)) {
          return; // отмена сохранения
        }
      }
    }

    onSave(student.id, {
      lastName: form.lastName,
      firstName: form.firstName,
      patronymic: form.patronymic,
      birthDate: form.birthDate,
      attemptNumber: form.attemptNumber,
      lastAttemptDate: form.lastAttemptDate,
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px 16px 100px 16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>✏️ Редактировать</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Фамилия *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Имя *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Отчество</label>
            <input
              type="text"
              value={form.patronymic}
              onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Дата рождения *</label>
            <input
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              value={form.birthDate}
              onChange={(e) => handleDateChange('birthDate', e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>№ последней попытки</label>
              <input
                type="number"
                min="0"
                value={form.attemptNumber}
                onChange={(e) => setForm({ ...form, attemptNumber: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Дата последней попытки</label>
              <input
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={form.lastAttemptDate}
                onChange={(e) => handleDateChange('lastAttemptDate', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Изменение номера или даты попытки обновит последнюю запись.
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                padding: '10px 0',
                borderRadius: 12,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#e5e7eb',
                color: '#1f2937',
                padding: '10px 0',
                borderRadius: 12,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}