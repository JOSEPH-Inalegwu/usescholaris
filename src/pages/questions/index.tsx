import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { QuestionsHub } from '../../components/questions';

const QuestionsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <QuestionsHub />
      </div>
    </DashboardLayout>
  );
};

export default QuestionsPage;
