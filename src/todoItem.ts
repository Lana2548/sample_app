export enum State { All, Working, Done }
export enum Priority { low, mid, high }

export interface TodoItem {
  id: number
  name: string
  state: State.Working | State.Done
  deadline: Date
  priority: Priority.low | Priority.mid | Priority.high
  checked: boolean
}
