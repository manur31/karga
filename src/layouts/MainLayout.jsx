import { Outlet } from 'react-router';
import TabBar from '../components/TabBar/TabBar';
import GlobalSessionBar from '../components/GlobalSessionBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col text-white overflow-x-hidden">
      
      <main className="flex-1 w-full max-w-md mx-auto pb-32 px-4 pt-10">
        <Outlet />
      </main>

      <GlobalSessionBar />
      <TabBar />
      
    </div>
  );
}