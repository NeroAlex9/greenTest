import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

const stroke = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const ChatsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2 .9 3.8 2.4 5.1L5.4 20l4-1.8c.8.2 1.7.3 2.6.3 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5Z"
      fill="currentColor"
    />
  </Icon>
)

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" {...stroke} />
  </Icon>
)

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" {...stroke} strokeWidth={2.4} />
  </Icon>
)

export const BackIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 12H5M11 18l-6-6 6-6" {...stroke} />
  </Icon>
)

export const SendIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 12 3 4.5 21 12 3 19.5 4.5 12Zm0 0H12" {...stroke} />
  </Icon>
)

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" {...stroke} />
  </Icon>
)

export const PhoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"
      {...stroke}
    />
  </Icon>
)

export const MoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="5.5" r="1.8" fill="currentColor" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1.8" fill="currentColor" />
  </Icon>
)

export const EditIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" {...stroke} />
  </Icon>
)

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" {...stroke} />
  </Icon>
)

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" {...stroke} />
    <path d="m20 20-4-4" {...stroke} />
  </Icon>
)

export const TicksIcon = ({ double, ...props }: IconProps & { double?: boolean }) => (
  <svg width={double ? 18 : 13} height={12} viewBox={double ? '0 0 18 12' : '0 0 13 12'} fill="none" aria-hidden="true" {...props}>
    <path d="M1.5 6.5 4.8 9.8 11.5 2.5" {...stroke} strokeWidth={1.6} />
    {double && <path d="M8.3 9.3l.5.5 6.7-7.3" {...stroke} strokeWidth={1.6} />}
  </svg>
)

export const ClockIcon = (props: IconProps) => (
  <Icon size={12} {...props}>
    <circle cx="12" cy="12" r="9" {...stroke} strokeWidth={2.4} />
    <path d="M12 7v5l3 2" {...stroke} strokeWidth={2.4} />
  </Icon>
)

export const AlertIcon = (props: IconProps) => (
  <Icon size={13} {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="M12 7v6M12 16.5v.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
  </Icon>
)
