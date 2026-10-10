import { useState } from 'react';
import type { Student } from '../types';
import EditStudentModal from './EditStudentModal';

interface Props {
  student: Student;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Student>) => void;
  onStudentUpdated?: (updatedStudent: Student) => void;
}

export default function StudentDetail({ student, onClose, onUpdate, onStudentUpdated }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveEdit = (
    studentId: string,
    data: {
      lastName: string;
      firstName: string;
      patronymic: string;
      birthDate: string;
      attemptNumber?: string;
      lastAttemptDate?: string;
    }
  ) => {
    const updatedStudent: Partial<Student> = {
      lastName: data.lastName,
      firstName: data.firstName,
      patronymic: data.patronymic,
      birthDate: data.birthDate,
    };

    // Копируем текущие попытки
    let attempts = [...student.attempts];

    const attemptNum = parseInt(data.attemptNumber || '0');

    // Если указана дата и номер > 0 — обновляем последнюю попытку
    if (attemptNum > 0 && data.lastAttemptDate) {
      if (attempts.length > 0) {
        // Обновляем последнюю попытку
        const last = attempts[attempts.length - 1];
        attempts[attempts.length - 1] = {
          ...last,
          number: attemptNum,
          date: data.lastAttemptDate,
        };
      } else {
        // Если попыток нет — создаём первую
        attempts.push({
          date: data.lastAttemptDate,
          number: attemptNum,
        });
      }
    }

    // ПЕРЕСЧИТЫВАЕМ ВСЕ НОМЕРА ПО ПОРЯДКУ
    attempts = attempts.map((a, index) => ({
      ...a,
      number: index + 1,
    }));

    updatedStudent.attempts = attempts;
    onUpdate(studentId, updatedStudent);

    // Обновляем локальный объект студента для мгновенного отображения
    if (onStudentUpdated) {
      const newStudent: Student = {
        ...student,
        ...updatedStudent,
        attempts: attempts,
      };
      onStudentUpdated(newStudent);
    }
  };

  return (
    <>
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
          padding: 16,
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
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>
                {student.lastName} {student.firstName} {student.patronymic}
              </h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>📅 {student.birthDate}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#f3f4f6',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: 8 }}>📊 Попытки</h3>

            {student.attempts.length === 0 ? (
              <div
                style={{
                  background: '#f9fafb',
                  padding: 16,
                  borderRadius: 12,
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <div style={{ fontSize: 40 }}>🎯</div>
                <p>Ещё не сдавал экзамен</p>
              </div>
            ) : (
              student.attempts.map((attempt, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f9fafb',
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        background: '#e9d5ff',
                        color: '#6b21a5',
                        padding: '2px 12px',
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      №{attempt.number}
                    </span>
                    <span style={{ color: '#4b5563' }}>{attempt.date}</span>
                  </div>
                  {attempt.result && (
                    <span
                      style={{
                        background:
                          attempt.result === 'сдан'
                            ? '#dcfce7'
                            : attempt.result === 'не сдан'
                            ? '#fee2e2'
                            : '#fef9c3',
                        color:
                          attempt.result === 'сдан'
                            ? '#166534'
                            : attempt.result === 'не сдан'
                            ? '#991b1b'
                            : '#854d0e',
                        padding: '2px 12px',
                        borderRadius: 20,
                        fontSize: 14,
                      }}
                    >
                      {attempt.result === 'сдан' ? '✅' : attempt.result === 'не сдан' ? '❌' : '⏳'} {attempt.result}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{
                flex: 1,
                background: '#f59e0b',
                color: 'white',
                padding: '10px 0',
                borderRadius: 12,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✏️ Редактировать
            </button>
            <button
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
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditStudentModal
          student={student}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}