import { useState } from 'react';
import type { Student } from '../types';
import { getUpcomingWednesdays } from '../utils/dateUtils';
import StudentDetail from './StudentDetail';

interface Props {
  students: Student[];
  examDays: { date: string; studentIds: string[] }[];
  onAddToExamDay: (date: string, studentId: string) => void;
  onRemoveFromExamDay: (date: string, studentId: string) => void;
  getAvailableStudentsForDate: (date: string) => Student[];
  getStudentsForExamDay: (date: string) => Student[];
}

export default function Calendar({
  students,
  onAddToExamDay,
  onRemoveFromExamDay,
  getAvailableStudentsForDate,
  getStudentsForExamDay,
}: Props) {
  const wednesdays = getUpcomingWednesdays(30);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
      <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>📅 Календарь</h2>
    </div>

      {wednesdays.map((date) => {
        const availableStudents = getAvailableStudentsForDate(date);
        const addedStudents = getStudentsForExamDay(date);
        const uniqueStudentIds = new Set([
          ...availableStudents.map((s) => s.id),
          ...addedStudents.map((s) => s.id),
        ]);
        const uniqueStudents = students.filter((s) => uniqueStudentIds.has(s.id));

        return (
          <div
            key={date}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>{date}</h3>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {addedStudents.length > 0 ? `✅ ${addedStudents.length} записан(о)` : 'Нет записей'}
              </span>
            </div>

            {uniqueStudents.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Нет доступных курсантов</p>
            ) : (
              uniqueStudents.map((student) => {
                const isAdded = addedStudents.some((s) => s.id === student.id);
                const isAvailable = availableStudents.some((s) => s.id === student.id);

                return (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div style={{ fontSize: 16, fontWeight: 'medium' }}>
                      {student.lastName} {student.firstName} {student.patronymic}
                    </div>
                    {isAdded ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Удалить ${student.lastName} ${student.firstName} из списка?`)) {
                            onRemoveFromExamDay(date, student.id);
                          }
                        }}
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
                          marginLeft: 8,
                        }}
                      >
                        ✕
                      </button>
                    ) : isAvailable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToExamDay(date, student.id);
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          fontSize: 24,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        ✓
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>Не доступен</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}

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