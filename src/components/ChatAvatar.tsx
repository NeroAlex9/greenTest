import { Avatar, type AvatarTextGradient } from '@maxhub/max-ui'

const GRADIENTS: AvatarTextGradient[] = ['red', 'orange', 'green', 'blue', 'purple']

function initials(title: string) {
  const letters = title
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
  return letters.join('') || '?'
}

export function ChatAvatar({ title, size = 48 }: { title: string; size?: number }) {
  const hash = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (
    <Avatar.Container size={size}>
      <Avatar.Text gradient={GRADIENTS[hash % GRADIENTS.length]}>{initials(title)}</Avatar.Text>
    </Avatar.Container>
  )
}
