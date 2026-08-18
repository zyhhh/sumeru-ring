export type CommandKind = 'maven' | 'docker' | 'git' | 'curl'

export interface CommandForm {
  kind: CommandKind
  target: string
  option: string
  extra: string
}

function quote(value: string): string {
  return /[\s"'\\$`]/.test(value) ? `'${value.split("'").join(`'\\''`)}'` : value
}

export function buildCommand(form: CommandForm): string {
  const target = form.target.trim()
  const extra = form.extra.trim()
  if (form.kind === 'maven') return ['mvn', form.option || 'clean package', target && `-pl ${quote(target)}`, extra].filter(Boolean).join(' ')
  if (form.kind === 'docker') return ['docker', form.option || 'run', target && quote(target), extra].filter(Boolean).join(' ')
  if (form.kind === 'git') return ['git', form.option || 'status', target && quote(target), extra].filter(Boolean).join(' ')
  return ['curl', form.option || '-X GET', target && quote(target), extra].filter(Boolean).join(' ')
}
