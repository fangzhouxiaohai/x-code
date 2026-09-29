import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Ic({ size = 20, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSidebar = (p: P) => (
  <Ic {...p}>
    <rect x="3" y="3.5" width="18" height="17" rx="3" />
    <path d="M9.5 3.5v17" />
  </Ic>
);

export const IconNewChat = (p: P) => (
  <Ic {...p}>
    <path d="M12 20.5h8.5" />
    <path d="M17.2 3.8a2.1 2.1 0 0 1 3 3L8.5 18.5 4 20l1.5-4.5Z" />
  </Ic>
);

export const IconSearch = (p: P) => (
  <Ic {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Ic>
);

export const IconLibrary = (p: P) => (
  <Ic {...p}>
    <rect x="3" y="6" width="14" height="14" rx="2.5" />
    <path d="M7 6V5.5A2.5 2.5 0 0 1 9.5 3h8A3.5 3.5 0 0 1 21 6.5v8a2.5 2.5 0 0 1-2.5 2.5H18" />
    <circle cx="7.5" cy="10.5" r="1.4" />
    <path d="m3.5 17.5 3.3-3.3a1.4 1.4 0 0 1 2 0l2.7 2.7 1.6-1.6a1.4 1.4 0 0 1 2 0l1.9 1.9" />
  </Ic>
);

export const IconSora = (p: P) => (
  <Ic {...p}>
    <rect x="3" y="5" width="18" height="15" rx="3" />
    <path d="m10 10 5 2.5-5 2.5Z" />
    <path d="M7 2.5v4M12 2.5v4M17 2.5v4" />
  </Ic>
);

export const IconGpts = (p: P) => (
  <Ic {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </Ic>
);

export const IconChevronDown = (p: P) => (
  <Ic {...p}>
    <path d="m6 9 6 6 6-6" />
  </Ic>
);

export const IconPlus = (p: P) => (
  <Ic {...p}>
    <path d="M12 5v14M5 12h14" />
  </Ic>
);

export const IconAttach = (p: P) => (
  <Ic {...p}>
    <path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Ic>
);

export const IconTools = (p: P) => (
  <Ic {...p}>
    <path d="M4 8h9m5 0h2" />
    <circle cx="16" cy="8" r="2.2" />
    <path d="M20 16h-9m-5 0H4" />
    <circle cx="8" cy="16" r="2.2" />
  </Ic>
);

export const IconMic = (p: P) => (
  <Ic {...p}>
    <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3.5" />
  </Ic>
);

export const IconArrowUp = (p: P) => (
  <Ic {...p}>
    <path d="M12 19V5" />
    <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
  </Ic>
);

export const IconWaveform = (p: P) => (
  <Ic {...p} strokeWidth={1.9}>
    <path d="M4 10v4M8 7v10M12 4.5v15M16 7v10M20 10v4" />
  </Ic>
);

export const IconStop = (p: P) => (
  <Ic {...p}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />
  </Ic>
);

export const IconCopy = (p: P) => (
  <Ic {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </Ic>
);

export const IconCheck = (p: P) => (
  <Ic {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Ic>
);

export const IconThumbUp = (p: P) => (
  <Ic {...p}>
    <path d="M7 10.5v10H4.5v-10Z" />
    <path d="M7 11 11.3 3.6A2 2 0 0 1 15 4.6V9h4a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.6 20H7" />
  </Ic>
);

export const IconThumbDown = (p: P) => (
  <Ic {...p}>
    <path d="M17 13.5v-10h2.5v10Z" />
    <path d="M17 13 12.7 20.4A2 2 0 0 1 9 19.4V15H5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6.4 4H17" />
  </Ic>
);

export const IconSpeaker = (p: P) => (
  <Ic {...p}>
    <path d="M11 5 6.5 8.5H3v7h3.5L11 19Z" />
    <path d="M15 9a4.2 4.2 0 0 1 0 6" />
    <path d="M18 6.5a8 8 0 0 1 0 11" />
  </Ic>
);

export const IconRefresh = (p: P) => (
  <Ic {...p}>
    <path d="M20 11.5a8 8 0 1 0-.9 4.6" />
    <path d="M20 5.5v6h-6" />
  </Ic>
);

export const IconShare = (p: P) => (
  <Ic {...p}>
    <path d="M12 14.5v-11" />
    <path d="m7.5 8 4.5-4.5L16.5 8" />
    <path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
  </Ic>
);

export const IconDots = (p: P) => (
  <Ic {...p}>
    <circle cx="5" cy="12" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.15" fill="currentColor" stroke="none" />
  </Ic>
);

export const IconX = (p: P) => (
  <Ic {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Ic>
);

export const IconMinus = (p: P) => (
  <Ic {...p}>
    <path d="M5 12h14" />
  </Ic>
);

export const IconMaximize = (p: P) => (
  <Ic {...p}>
    <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" />
  </Ic>
);

export const IconRestore = (p: P) => (
  <Ic {...p}>
    <rect x="4.5" y="8" width="11.5" height="11.5" rx="1.5" />
    <path d="M8 5.5h9A2.5 2.5 0 0 1 19.5 8v9" />
  </Ic>
);

export const IconTrash = (p: P) => (
  <Ic {...p}>
    <path d="M4 6.5h16" />
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
  </Ic>
);

export const IconPencil = (p: P) => (
  <Ic {...p}>
    <path d="M17 3.7a2.2 2.2 0 0 1 3.1 3.1L8 18.9 4 20l1.1-4Z" />
  </Ic>
);

export const IconArchive = (p: P) => (
  <Ic {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.5" />
    <path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5" />
    <path d="M9.5 12.5h5" />
  </Ic>
);

export const IconSettings = (p: P) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
  </Ic>
);

export const IconDiamond = (p: P) => (
  <Ic {...p}>
    <path d="M6 3.5h12L21 9l-9 11.5L3 9Z" />
    <path d="M3 9h18" />
    <path d="M9.5 9 12 3.5 14.5 9 12 20.5Z" />
  </Ic>
);

export const IconClock = (p: P) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </Ic>
);

export const IconEnter = (p: P) => (
  <Ic {...p}>
    <path d="M20 5v6a3 3 0 0 1-3 3H5" />
    <path d="m8.5 10.5-4 3.5 4 3.5" />
  </Ic>
);

/**
 * X-Code mark — an original geometric "hexagonal knot" in the style of the
 * OpenAI blossom: six interlocking rounded arms rotated around the center.
 */
export const XCodeLogo = ({ size = 20, ...rest }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <rect key={a} x="9.15" y="1.7" width="5.7" height="13.1" rx="2.85" transform={`rotate(${a} 12 12)`} />
    ))}
  </svg>
);
