"use client";
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-white ">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-white ">
        {children}
      </div>
      
    </div>
  );
};

export default MainLayout;