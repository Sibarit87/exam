import { useState } from 'react';
import type { Student } from '../types';
import AddStudentModal from './AddStudentModal';
import StudentDetail from './StudentDetail';

interface Props {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'attempts' | 'isActive' | 'isHidden'> & { 
    lastAttemptDate?: string; 
    attemptNumber?: string;
  }) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onToggleHideStudent: (id: string) => void;
}

export default function Students({ 
  students, 
  onAddStudent, 
  onDeleteStudent, 
  onUpdateStudent,
  onToggleHideStudent 
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const visibleStudents = students
    .filter(s => s.isActive && (showHidden ? s.isHidden : !s.isHidden))
    .filter(s => {
      if (!normalizedQuery) return true;
      const fullName = `${s.lastName} ${s.firstName} ${s.patronymic}`.toLowerCase();
      return fullName.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const byLast = a.lastName.localeCompare(b.lastName, 'ru', { sensitivity: 'base' });
      if (byLast !== 0) return byLast;
      const byFirst = a.firstName.localeCompare(b.firstName, 'ru', { sensitivity: 'base' });
      if (byFirst !== 0) return byFirst;
      return a.patronymic.localeCompare(b.patronymic, 'ru', { sensitivity: 'base' });
    });

  return (
    <div style={{ padding: 16 }}>
      {/* ЛИПКИЙ ЗАГОЛОВОК */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: '#f3f4f6',
          paddingTop: 8,
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>
            {showHidden ? '👁️ Скрытые' : '👨‍🎓 Курсанты'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Кнопка переключения скрытых — круглая, с иконкой глаза */}
            <button
              onClick={() => setShowHidden(!showHidden)}
              title={showHidden ? 'Показать основной список' : 'Показать скрытых'}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: showHidden ? '#8b5cf6' : '#9ca3af',
                color: 'white',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {showHidden ? '👁️' : '🙈'}
            </button>
            {!showHidden && (
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Добавить
              </button>
            )}
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          {showHidden ? 'Скрытые не видны в календаре и списках' : `Показано: ${visibleStudents.length}`}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по ФИО"
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid #d1d5db',
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* СПИСОК */}
      {visibleStudents.length === 0 ? (
        <div
          style={{
            background: 'white',
            padding: 32,
            borderRadius: 12,
            textAlign: 'center',
            color: '#9ca3af',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {showHidden ? '📭' : '📭'}
          </div>
          <p>
            {normalizedQuery
              ? 'Никого не нашли'
              : showHidden
                ? 'Нет скрытых курсантов'
                : 'Нет добавленных курсантов'}
          </p>
          {!showHidden && !normalizedQuery && (
            <p style={{ fontSize: 14, marginTop: 4 }}>Нажмите «+ Добавить», чтобы начать</p>
          )}
        </div>
      ) : (
        visibleStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            style={{
              background: 'white',
              padding: 12,
              borderRadius: 12,
              marginBottom: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              opacity: student.isHidden ? 0.6 : 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>
              {student.lastName} {student.firstName} {student.patronymic}
              {student.isHidden && ' (скрыт)'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {showHidden ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHideStudent(student.id);
                  }}
                  title="Вернуть в основной список"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#22c55e',
                    color: 'white',
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  👁️
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHideStudent(student.id);
                  }}
                  title="Скрыть из списков"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#9ca3af',
                    color: 'white',
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  🙈
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Удалить ${student.lastName} ${student.firstName}?`)) {
                    onDeleteStudent(student.id);
                  }
                }}
                title="Удалить"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  fontSize: 24,
                  fontWeight: 'bold',
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
          </div>
        ))
      )}

      {isModalOpen && (
        <AddStudentModal
          onClose={() => setIsModalOpen(false)}
          onAdd={onAddStudent}
        />
      )}

      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={onUpdateStudent}
          onStudentUpdated={(updated) => setSelectedStudent(updated)}
        />
      )}
    </div>
  );
}