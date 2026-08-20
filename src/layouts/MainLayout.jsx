import { Outlet } from "react-router";
import TabBar from "../components/TabBar/TabBar";
import SessionTimer from "../components/SessionTimer";
import RestTimer from "../components/RestTimer";
import { getCachedProfile } from "../storage/profile-storage";
import usePWA from "../hooks/usePWA";
import useInstallBanner from "../hooks/useInstallBanner";
import InstallPWAModal from "../components/InstallPWAModal";
import { useBootstrapSync } from "../hooks/useSync";

export default function MainLayout() {
  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  useBootstrapSync(!!profile_id);

  const { isStandalone, isInstallable, install } = usePWA();
  const { shouldShow, dismiss, markInstalled } = useInstallBanner({
    isStandalone,
    isInstallable,
  });

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col text-white overflow-x-hidden">
      <main className="flex-1 w-full max-w-md mx-auto overflow-x-hidden mb-20">
        <Outlet />
      </main>

      <SessionTimer profile_id={profile_id} />
      <RestTimer />
      <TabBar />

      <InstallPWAModal
        shouldShow={shouldShow}
        isStandalone={isStandalone}
        isInstallable={isInstallable}
        install={install}
        onDismiss={dismiss}
        onInstall={markInstalled}
      />
    </div>
  );
}
