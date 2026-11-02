export default function LibraryMascot({ size = 'large', isThinking = false, className = '' }) {
  const isLarge = size === 'large'
  const isSmall = size === 'small'

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        isLarge
          ? 'w-36 sm:w-44 h-44 sm:h-52'
          : isSmall
            ? 'w-8 h-9'
            : 'w-10 h-12'
      } ${className}`}
    >
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full"
        style={{
          filter: isLarge
            ? 'drop-shadow(0 14px 20px rgba(0,0,0,0.55)) contrast(1.05)'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        }}
      >
        <defs>
          <radialGradient id="hubMascotHeadGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="60%" stopColor="#ffd868" />
            <stop offset="100%" stopColor="#f3be44" />
          </radialGradient>

          <linearGradient id="hubMascotLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          <linearGradient id="hubMascotShirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d5f477" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>

          <linearGradient id="hubMascotShortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <radialGradient id="hubMascotGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Ground Shadow */}
        {isLarge && (
          <ellipse cx="100" cy="226" rx="55" ry="12" fill="url(#hubMascotGroundShadow)">
            <animate
              attributeName="rx"
              values="55;47;55"
              keyTimes="0;0.5;1"
              dur="3.2s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            />
          </ellipse>
        )}

        {/* Mascot Body Group with Float and subtle Thinking Animation */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={isThinking ? '0 0; 0 -8; 0 0' : '0 0; 0 -6; 0 0'}
            keyTimes="0;0.5;1"
            dur={isThinking ? '1.8s' : '3.2s'}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          />

          {/* Sprout Leaf Cap */}
          <g transform="translate(100, 38)">
            {isThinking && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0; 10 0 0; -10 0 0; 0 0 0"
                dur="1.4s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
            <path
              d="M -15,-15 C -25,-32 10,-38 35,-18 C 38,-4 15,2 -15,-15 Z"
              fill="url(#hubMascotLeafGrad)"
              stroke="#16a34a"
              strokeWidth="1.5"
            />
            <path
              d="M -5,-16 Q 10,-22 25,-18"
              fill="none"
              stroke="#15803d"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="8" cy="-18" r="3" fill="#ffffff" opacity="0.4" />
          </g>

          {/* Chubby Head */}
          <ellipse cx="100" cy="85" rx="56" ry="50" fill="url(#hubMascotHeadGrad)" />
          {/* Head Gloss Highlight */}
          <ellipse
            cx="78"
            cy="58"
            rx="18"
            ry="9"
            fill="#ffffff"
            opacity="0.45"
            transform="rotate(-15 78 58)"
          />

          {/* Rosy Cheeks */}
          <circle cx="68" cy="98" r="7" fill="#fb7185" opacity="0.4" />
          <circle cx="132" cy="98" r="7" fill="#fb7185" opacity="0.4" />

          {/* Eyes (Blink and look around when thinking) */}
          <g>
            {[78, 122].map((cx) => (
              <ellipse key={cx} cx={cx} cy="88" rx="4.5" ry="4.5" fill="#1e1e24">
                <animate
                  attributeName="ry"
                  values="4.5;4.5;0.5;4.5;4.5"
                  keyTimes="0;0.9;0.94;0.98;1"
                  dur={isThinking ? '2s' : '4s'}
                  repeatCount="indefinite"
                />
              </ellipse>
            ))}
            <circle cx={isThinking ? '75.5' : '76.5'} cy="86.5" r="1.5" fill="#ffffff" />
            <circle cx={isThinking ? '119.5' : '120.5'} cy="86.5" r="1.5" fill="#ffffff" />
          </g>

          {/* Smile / Mouth */}
          <path
            d="M 94,98 Q 100,104 106,98"
            fill="none"
            stroke="#27272a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Chubby Arms */}
          <ellipse
            cx="52"
            cy="150"
            rx="11"
            ry="18"
            fill="url(#hubMascotHeadGrad)"
            transform="rotate(25 52 150)"
          />
          <ellipse
            cx="148"
            cy="150"
            rx="11"
            ry="18"
            fill="url(#hubMascotHeadGrad)"
            transform="rotate(-25 148 150)"
          />

          {/* Torso / Shirt in Neon Lime */}
          <path
            d="M 64,130 C 64,120 136,120 136,130 C 140,165 140,175 132,185 C 122,192 78,192 68,185 C 60,175 60,165 64,130 Z"
            fill="url(#hubMascotShirtGrad)"
          />

          {/* Smiley Arc on Shirt */}
          <path
            d="M 85,148 Q 100,160 115,148"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Cute Shorts */}
          <path
            d="M 67,175 C 75,170 125,170 133,175 C 137,195 132,208 120,212 C 108,215 104,204 100,204 C 96,204 92,215 80,212 C 68,208 63,195 67,175 Z"
            fill="url(#hubMascotShortsGrad)"
          />

          {/* Legs */}
          <ellipse cx="84" cy="216" rx="9" ry="12" fill="url(#hubMascotHeadGrad)" />
          <ellipse cx="116" cy="216" rx="9" ry="12" fill="url(#hubMascotHeadGrad)" />
        </g>
      </svg>
    </div>
  )
}
