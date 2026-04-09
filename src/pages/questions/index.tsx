import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { QuestionsHub } from '../../components/questions';

const QuestionsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <QuestionsHub />
    </DashboardLayout>
  );
};

export default QuestionsPage;
