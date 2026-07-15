import { Outlet } from 'react-router';
import TabBar from '../components/TabBar/TabBar';
import SessionTimer from '../components/SessionTimer';
import RestTimer from '../components/RestTimer';
import { useAuth } from '../hooks/queries/useAuth';

export default function MainLayout() {
  const { profile_id } = getCachedProfile();

  const { isStandalone, isInstallable, install } = usePWA();
  const { shouldShow, dismiss, markInstalled } = useInstallBanner({
    isStandalone,
    isInstallable,
  });

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col text-white overflow-x-hidden">
      
      <main className="flex-1 w-full max-w-md mx-auto overflow-x-hidden">
        <Outlet />
      </main>

      <SessionTimer profile_id={profile_id} />
      <RestTimer />
      <TabBar />
      
    </div>
  );
}