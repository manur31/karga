import { Outlet } from 'react-router';
import TabBar from '../components/TabBar/TabBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#272121] flex flex-col text-white">
      
      <main className="flex-1 pb-32 px-4 pt-10">
        <Outlet />
      </main>

      <TabBar />
      
    </div>
  );
}