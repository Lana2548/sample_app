export enum State { All, Working, Done }
export enum Priority { low, mid, high }

export interface TodoItem {
  id: number
  name: string
  state: State.Working | State.Done
  deadline: string
  priority: Priority.low | Priority.mid | Priority.high
  checked: boolean
  isExpired: boolean
}
