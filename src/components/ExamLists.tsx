import { useState } from 'react';
import type { Student } from '../types';
import StudentDetail from './StudentDetail';

interface Props {
  examDays: { date: string; studentIds: string[] }[];
  onSaveExamResults: (date: string, results: { studentId: string; result: 'сдан' | 'не сдан' | 'не явился' }[]) => void;
  getStudentsForExamDay: (date: string) => Student[];
}

export default function ExamLists({ examDays, onSaveExamResults, getStudentsForExamDay }: Props) {
  const [resultForStudent, setResultForStudent] = useState<{ [key: string]: 'сдан' | 'не сдан' | 'не явился' }>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureExamDays = examDays.filter((examDay) => {
    const [d, m, y] = examDay.date.split('.').map(Number);
    const examDate = new Date(y, m - 1, d);
    examDate.setHours(0, 0, 0, 0);
    return examDate >= today;
  });

  const sortedExamDays = [...futureExamDays]
    .filter((examDay) => getStudentsForExamDay(examDay.date).length > 0)
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('.').map(Number);
      const [d2, m2, y2] = b.date.split('.').map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    });

  const handleResultChange = (studentId: string, result: 'сдан' | 'не сдан' | 'не явился') => {
    setResultForStudent((prev) => ({ ...prev, [studentId]: result }));
  };

  const handleConfirmResults = (date: string) => {
    const studentsForDate = getStudentsForExamDay(date);
    const results: { studentId: string; result: 'сдан' | 'не сдан' | 'не явился' }[] = [];

    studentsForDate.forEach((student) => {
      const result = resultForStudent[student.id];
      if (result) {
        results.push({ studentId: student.id, result });
      }
    });

    if (results.length === 0) {
      alert('Выберите результат хотя бы для одного курсанта');
      return;
    }

    onSaveExamResults(date, results);

    // Очищаем выбранные результаты для этой даты
    const newResults = { ...resultForStudent };
    studentsForDate.forEach((student) => {
      delete newResults[student.id];
    });
    setResultForStudent(newResults);

    alert('Результаты сохранены! Данные обновлены.');
  };

  const handleCopyList = (date: string) => {
    const studentsForDate = getStudentsForExamDay(date);
    if (studentsForDate.length === 0) {
      alert('Список пуст');
      return;
    }
    const listText = studentsForDate
      .map((s) => `${s.lastName} ${s.firstName} ${s.patronymic}, ${s.birthDate}`)
      .join('\n');
    navigator.clipboard?.writeText(listText);
    alert('Список скопирован в буфер обмена!');
  };

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
      <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>📋 Списки на экзамен</h2>
    </div>

      {sortedExamDays.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>Нет предстоящих экзаменов</p>
      ) : (
        sortedExamDays.map((examDay) => {
          const studentsForDate = getStudentsForExamDay(examDay.date);
          return (
            <div
              key={examDay.date}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>📋 {examDay.date}</h3>
                <button
                  onClick={() => handleCopyList(examDay.date)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: 12,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  📋 Копировать всё
                </button>
              </div>

              {studentsForDate.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>Нет записанных курсантов</p>
              ) : (
                <div>
                  {studentsForDate.map((student) => (
                    <div
                      key={student.id}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 'medium',
                          cursor: 'pointer',
                          marginBottom: 6,
                        }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        {student.lastName} {student.firstName} {student.patronymic}
                        <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>
                          {student.birthDate}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleResultChange(student.id, 'сдан')}
                          style={{
                            flex: 1,
                            minWidth: 80,
                            padding: '6px 0',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            background:
                              resultForStudent[student.id] === 'сдан' ? '#22c55e' : '#f3f4f6',
                            color: resultForStudent[student.id] === 'сдан' ? 'white' : '#4b5563',
                          }}
                        >
                          ✅ Сдан
                        </button>
                        <button
                          onClick={() => handleResultChange(student.id, 'не сдан')}
                          style={{
                            flex: 1,
                            minWidth: 80,
                            padding: '6px 0',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            background:
                              resultForStudent[student.id] === 'не сдан' ? '#ef4444' : '#f3f4f6',
                            color: resultForStudent[student.id] === 'не сдан' ? 'white' : '#4b5563',
                          }}
                        >
                          ❌ Не сдан
                        </button>
                        <button
                          onClick={() => handleResultChange(student.id, 'не явился')}
                          style={{
                            flex: 1,
                            minWidth: 80,
                            padding: '6px 0',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            background:
                              resultForStudent[student.id] === 'не явился' ? '#f59e0b' : '#f3f4f6',
                            color: resultForStudent[student.id] === 'не явился' ? 'white' : '#4b5563',
                          }}
                        >
                          ⏳ Не явился
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleConfirmResults(examDay.date)}
                    style={{
                      width: '100%',
                      marginTop: 12,
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px 0',
                      borderRadius: 12,
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    ✅ Подтвердить результаты
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}