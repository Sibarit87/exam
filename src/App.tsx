import { useState } from 'react';
import { useStorage } from './hooks/useStorage';
import Students from './components/Students';
import Calendar from './components/Calendar';
import ExamLists from './components/ExamLists';
import CloudBackup from './components/CloudBackup';

type Tab = 'students' | 'calendar' | 'lists' | 'cloud';

function App() {
  const { 
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
    saveData,
  } = useStorage();

  const [activeTab, setActiveTab] = useState<Tab>('students');

  if (loading) {
    return <div className="text-center p-10 text-lg">Загрузка...</div>;
  }

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      minHeight: '100vh',
      background: '#f3f4f6',
      position: 'relative',
      paddingBottom: '90px'
    }}>
      <div>
        {activeTab === 'students' && (
          <Students 
            students={data.students}
            onAddStudent={addStudent}
            onDeleteStudent={deleteStudent}
            onUpdateStudent={updateStudent}
            onToggleHideStudent={toggleHideStudent}
          />
        )}
        {activeTab === 'calendar' && (
          <Calendar 
            students={data.students}
            examDays={data.examDays}
            onAddToExamDay={addToExamDay}
            onRemoveFromExamDay={removeFromExamDay}
            getAvailableStudentsForDate={getAvailableStudentsForDate}
            getStudentsForExamDay={getStudentsForExamDay}
          />
        )}
        {activeTab === 'lists' && (
          <ExamLists 
  examDays={data.examDays}
  onSaveExamResults={saveExamResults}
  getStudentsForExamDay={getStudentsForExamDay}
/>
        )}
        {activeTab === 'cloud' && (
          <CloudBackup
            data={data}
            onRestore={saveData}
          />
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        background: 'white',
        borderTop: '2px solid #e5e7eb',
        boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        padding: '8px 4px',
        zIndex: 9999
      }}>
        <TabButton
          active={activeTab === 'students'}
          emoji="👨‍🎓"
          label="Курсанты"
          onClick={() => setActiveTab('students')}
        />
        <TabButton
          active={activeTab === 'calendar'}
          emoji="📅"
          label="Календарь"
          onClick={() => setActiveTab('calendar')}
        />
        <TabButton
          active={activeTab === 'lists'}
          emoji="📋"
          label="Списки"
          onClick={() => setActiveTab('lists')}
        />
        <TabButton
          active={activeTab === 'cloud'}
          emoji="☁️"
          label="Облако"
          onClick={() => setActiveTab('cloud')}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        flex: 1,
        padding: '12px 0',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '13px',
        borderRadius: '12px',
        margin: '0 2px',
        background: active ? '#3b82f6' : 'transparent',
        color: active ? 'white' : '#4b5563',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: '22px' }}>{emoji}</div>
      <div>{label}</div>
    </button>
  );
}

export default App;