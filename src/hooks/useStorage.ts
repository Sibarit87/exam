import { useState, useEffect } from 'react';
import type { AppData, Student } from '../types';
import { isStudentAvailableOnDate } from '../utils/dateUtils';

const STORAGE_KEY = 'avto_app_data';
const defaultData: AppData = { students: [], examDays: [] };

export function useStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppData;
        const examDays = (parsed.examDays || []).filter(
          (day) => Array.isArray(day.studentIds) && day.studentIds.length > 0
        );
        const cleaned: AppData = {
          students: parsed.students || [],
          examDays,
        };
        setData(cleaned);
        if (examDays.length !== (parsed.examDays || []).length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      } catch {
        setData(defaultData);
      }
    }
    setLoading(false);
  }, []);

  const saveData = (newData: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  };

const addStudent = (student: Omit<Student, 'id' | 'attempts' | 'isActive' | 'isHidden'> & { 
  lastAttemptDate?: string; 
  attemptNumber?: string;
}) => {
  const attemptNum = parseInt(student.attemptNumber || '0');
  const attempts = [];
  
  if (attemptNum > 0 && student.lastAttemptDate) {
    attempts.push({
      date: student.lastAttemptDate,
      number: attemptNum,
    });
  }
  
  const newStudent: Student = {
    id: crypto.randomUUID(),
    lastName: student.lastName,
    firstName: student.firstName,
    patronymic: student.patronymic || '',
    birthDate: student.birthDate,
    attempts: attempts,
    isActive: true,
    isHidden: false, // <-- Добавляем поле
  };
  
  saveData({ ...data, students: [...data.students, newStudent] });
};

  const deleteStudent = (id: string) => {
    saveData({
      students: data.students.filter(s => s.id !== id),
      examDays: data.examDays
        .map(d => ({ ...d, studentIds: d.studentIds.filter(studentId => studentId !== id) }))
        .filter(d => d.studentIds.length > 0),
    });
  };

  const toggleHideStudent = (id: string) => {
  saveData({
    ...data,
    students: data.students.map(s =>
      s.id === id ? { ...s, isHidden: !s.isHidden } : s
    ),
  });
};

  const updateStudent = (id: string, updates: Partial<Student>) => {
    saveData({ ...data, students: data.students.map(s => s.id === id ? { ...s, ...updates } : s) });
  };

  const addToExamDay = (date: string, studentId: string) => {
    const existing = data.examDays.find(d => d.date === date);
    if (existing) {
      if (!existing.studentIds.includes(studentId)) {
        saveData({ ...data, examDays: data.examDays.map(d =>
          d.date === date ? { ...d, studentIds: [...d.studentIds, studentId] } : d
        ) });
      }
    } else {
      saveData({ ...data, examDays: [...data.examDays, { date, studentIds: [studentId] }] });
    }
  };

  const removeFromExamDay = (date: string, studentId: string) => {
    saveData({
      ...data,
      examDays: data.examDays
        .map(d => d.date === date ? { ...d, studentIds: d.studentIds.filter(id => id !== studentId) } : d)
        .filter(d => d.studentIds.length > 0),
    });
  };

  const saveExamResults = (
    date: string,
    results: { studentId: string; result: 'сдан' | 'не сдан' | 'не явился' }[]
  ) => {
    let updatedStudents = [...data.students];
    let updatedExamDays = [...data.examDays];

    results.forEach(({ studentId, result }) => {
      const studentIndex = updatedStudents.findIndex(s => s.id === studentId);
      if (studentIndex === -1) return;

      const student = updatedStudents[studentIndex];

      // Если результат 'не явился' — НЕ добавляем попытку, только удаляем из списка
      if (result !== 'не явился') {
        let attempts = [...student.attempts];
        const attemptIndex = attempts.findIndex(a => a.date === date);

        if (attemptIndex !== -1) {
          attempts[attemptIndex] = { ...attempts[attemptIndex], result };
        } else {
          const nextNumber = attempts.length > 0 ? attempts[attempts.length - 1].number + 1 : 1;
          attempts.push({ date, number: nextNumber, result });
        }

        if (result === 'сдан') {
          updatedStudents[studentIndex] = { ...student, attempts, isActive: false };
        } else {
          // не сдан
          updatedStudents[studentIndex] = { ...student, attempts };
        }
      } else {
        // Не явился — студент остаётся без изменений
        updatedStudents[studentIndex] = student;
      }

      // Удаляем студента из списка на этот день (для всех результатов, включая 'не явился')
      updatedExamDays = updatedExamDays.map(d =>
        d.date === date ? { ...d, studentIds: d.studentIds.filter(id => id !== studentId) } : d
      ).filter(d => d.studentIds.length > 0);
    });

    saveData({ students: updatedStudents, examDays: updatedExamDays });
  };

const getAvailableStudentsForDate = (date: string): Student[] => {
  return data.students.filter(s => 
    s.isActive && !s.isHidden && isStudentAvailableOnDate(s, date)
  );
};

const getStudentsForExamDay = (date: string): Student[] => {
  const examDay = data.examDays.find(d => d.date === date);
  if (!examDay) return [];
  return data.students.filter(s => 
    examDay.studentIds.includes(s.id) && !s.isHidden
  );
};

  return { 
    data, 
    loading, 
    addStudent, 
    deleteStudent, 
    updateStudent,
    toggleHideStudent,
    addToExamDay,
    removeFromExamDay,
    saveExamResults,
    getAvailableStudentsForDate,
    getStudentsForExamDay, 
    saveData 
  };
}