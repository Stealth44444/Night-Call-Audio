'use client'

import Image from 'next/image'

const daws = [
  { name: 'FL Studio',     maker: 'Image-Line',     logo: '/pngwing.com.png',    filter: undefined },
  { name: 'Ableton Live',  maker: 'Ableton',        logo: '/pngwing.com (1).png', filter: 'invert(1)' },
  { name: 'Logic Pro',     maker: 'Apple',          logo: '/pngwing.com (2).png', filter: undefined },
  { name: 'Pro Tools',     maker: 'Avid',           logo: '/pngwing.com (3).png', filter: undefined },
  { name: 'Cubase',        maker: 'Steinberg',      logo: '/pngwing.com (4).png', filter: undefined },
  { name: 'Bitwig Studio', maker: 'Bitwig',         logo: '/pngwing.com (5).png', filter: undefined },
  { name: 'Reaper',        maker: 'Cockos',         logo: '/pngwing.com (6).png', filter: undefined },
  { name: 'Reason',        maker: 'Reason Studios', logo: '/pngwing.com (7).png', filter: undefined },
  { name: 'GarageBand',    maker: 'Apple',          logo: '/pngwing.com (8).png', filter: undefined },
  { name: 'Studio One',    maker: 'PreSonus',       logo: '/pngegg.png',          filter: undefined },
]

function DAWLogo({ name, maker, logo, filter }: { name: string; maker: string; logo: string | null; filter?: string }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] select-none">
      {logo && (
        <Image
          src={logo}
          alt={name}
          width={28}
          height={28}
          className="object-contain"
          style={filter ? { filter } : undefined}
        />
      )}
      <span className="font-display font-bold text-base text-white/80 whitespace-nowrap">
        {name}
      </span>
      <span className="text-xs text-white/25 whitespace-nowrap">{maker}</span>
    </div>
  )
}

export default function DAWMarquee() {
  const items = [...daws, ...daws]

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[var(--bg-deep)] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[var(--bg-deep)] to-transparent pointer-events-none" />

      {/* Row 1 - scroll left */}
      <div className="flex gap-4 mb-4 animate-marquee-left">
        {items.map((daw, i) => (
          <DAWLogo key={`r1-${i}`} name={daw.name} maker={daw.maker} logo={daw.logo} filter={daw.filter} />
        ))}
      </div>

      {/* Row 2 - scroll right */}
      <div className="flex gap-4 animate-marquee-right">
        {[...items].reverse().map((daw, i) => (
          <DAWLogo key={`r2-${i}`} name={daw.name} maker={daw.maker} logo={daw.logo} filter={daw.filter} />
        ))}
      </div>
    </div>
  )
}
