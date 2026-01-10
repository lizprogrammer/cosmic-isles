export const questState = {
  completed: false,

  complete() {
    this.completed = true;
    fetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({ questCompleted: true }),
    });
  },
};
