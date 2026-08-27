import React from 'react';

const LOGO_SRC = "data:image/webp;base64,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";
const IMG_SIZE = 254;
const SPLIT_X = 130.7;
const DISPLAY_SIZE = 112;

export default function LoadingScreen() {
  const scale = DISPLAY_SIZE / IMG_SIZE;
  const leftWidth = SPLIT_X * scale;
  const rightWidth = DISPLAY_SIZE - leftWidth;

  const sharedImgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DISPLAY_SIZE,
    height: DISPLAY_SIZE,
    maxWidth: 'none',
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-karga-gray">
      <style>{`
        @keyframes bounceK {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounceG {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .kg-strip-k img { animation: bounceK 1s ease-in-out infinite; }
        .kg-strip-g img { animation: bounceG 1s ease-in-out infinite; animation-delay: 0.18s; }
      `}</style>

      <div
        className="relative flex rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
      >
        {/* Strip 1: shows only the left portion of the logo (the "K" + dumbbells) */}
        <div
          className="kg-strip-k relative overflow-hidden bg-karga-orange"
          style={{ width: leftWidth, height: DISPLAY_SIZE }}
        >
          <img src={LOGO_SRC} alt="" style={sharedImgStyle} />
        </div>

        {/* Strip 2: shows only the right portion of the logo (the "g") */}
        <div
          className="kg-strip-g relative overflow-hidden bg-karga-orange"
          style={{ width: rightWidth, height: DISPLAY_SIZE }}
        >
          <img
            src={LOGO_SRC}
            alt=""
            style={{ ...sharedImgStyle, left: -leftWidth }}
          />
        </div>
      </div>
    </div>
  );
}