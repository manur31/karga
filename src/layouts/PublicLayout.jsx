import { Outlet } from 'react-router';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#272121] text-white flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto flex flex-col min-h-[85vh] sm:min-h-0 justify-between sm:justify-center gap-8">
        <div className="fixed -top-32 -right-32 w-[600px] h-[600px] z-10 rounded-full bg-[radial-gradient(ellipse_at_top_right,var(--color-karga-orange),transparent_90%)] blur-[110px] opacity-[0.08] pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-[600px] h-[600px] z-10 rounded-full bg-[radial-gradient(ellipse_at_bottom_left,var(--color-karga-orange),transparent_90%)] blur-[110px] opacity-[0.08] pointer-events-none"/>
            <main className="flex-1 flex flex-col justify-center w-full">
                <Outlet />
            </main>
        
        </div>
    </div>
  );
}