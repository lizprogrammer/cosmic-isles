export interface QuestState {
  completed: boolean
  complete: () => void
}

export const questState: QuestState = {
  completed: false,

  complete() {
    this.completed = true
    fetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({ questCompleted: true }),
    })
  },
}
