import { parse, format, addDays, addMonths, isAfter, startOfDay } from 'date-fns';

export function parseDate(str: string): Date {
  return parse(str, 'dd.MM.yyyy', new Date());
}

export function formatDate(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}

export function getNextAvailableDate(student: { attempts: { date: string; number: number; result?: string }[] }): Date | null {
  if (student.attempts.length === 0) {
    return startOfDay(new Date());
  }
  const last = student.attempts[student.attempts.length - 1];
  if (last.result === 'не явился') {
    return parseDate(last.date);
  }
  const lastDate = parseDate(last.date);
  if (last.number <= 2) {
    return startOfDay(addDays(lastDate, 7));
  }

  // После 3-й попытки: 6 календарных месяцев, не 182 дня.
  // Срок начинается на следующий день после экзамена и заканчивается
  // в ту же календарную дату через 6 месяцев — этот день ещё в сроке.
  // Пример: не сдал 5 января → 5 июля последний день срока → запись с 6 июля.
  return startOfDay(addDays(addMonths(lastDate, 6), 1));
}

export function isStudentAvailableOnDate(student: { attempts: { date: string; number: number; result?: string }[] }, dateStr: string): boolean {
  const examDate = startOfDay(parseDate(dateStr));
  const nextAvailable = getNextAvailableDate(student);
  if (!nextAvailable) return false;
  if (isAfter(startOfDay(new Date()), examDate)) return false;
  return !isAfter(nextAvailable, examDate);
}

export function getUpcomingWednesdays(count: number = 30): string[] {
  const dates: string[] = [];
  let current = startOfDay(addDays(new Date(), 1));
  while (dates.length < count) {
    if (current.getDay() === 3) {
      dates.push(formatDate(current));
    }
    current = addDays(current, 1);
  }
  return dates;
}