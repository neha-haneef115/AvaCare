"use client";
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {children}
      </div>
      
    </div>
  );
};

export default MainLayout;